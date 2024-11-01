Hooks.once('init', function() {
    console.log('D35E-CurseBuffs | Initializing Curse Buffs module');

    // Register module settings
    game.settings.register('cursebuffs', 'adjustAttributes', {
        name: 'Adjust Attribute Display',
        hint: 'If enabled, attributes will be visually adjusted to hide curse effects from players. If disabled, only tooltips will be filtered.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => {
            // Refresh all actor sheets when this setting changes
            Object.values(ui.windows)
                .filter(w => w instanceof ActorSheet)
                .forEach(sheet => sheet.render(true));
        }
    });

    // Add curse type to buff types
    CONFIG.D35E.buffTypes = {
        ...CONFIG.D35E.buffTypes,
        curse: "Curse"
    };

    // Add our styles
    const styles = `
    .gm-section { 
        background: rgba(128, 0, 0, 0.1); 
        border-bottom: 1px solid #782e22; 
    }
    .gm-section:before { 
        content: "[GM]"; 
        font-size: 10px; 
        margin-right: 5px; 
        color: #782e22; 
    }
    
    .inventory-list .item-detail.item-timeline {
        flex: 0 0 100px;
        color: #666;
        font-size: 12px;
        text-align: center;
    }
    
    .inventory-list .item-detail.item-level {
        flex: 0 0 100px;
        text-align: center;
    }
    
    .inventory-list .item-detail.item-level input {
        width: 40px;
        height: 20px;
        background: none;
        border: 1px solid transparent;
        text-align: center;
    }
    
    .inventory-list .item-detail.item-level input:hover,
    .inventory-list .item-detail.item-level input:focus {
        border: 1px solid #111;
    }
    
    .inventory-list .item-detail.item-active {
        flex: 0 0 60px;
        text-align: center;
    }
    
    .inventory-list .item-detail.item-active label.checkbox {
        margin: 0;
    }
    
    .inventory-list .item-detail.item-active input[type="checkbox"] {
        margin: 0;
    }
    `;
    
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
});

// Helper function to check if a tooltip line refers to a curse buff
function isCurseBuff(actor, line) {
    const buffNameMatch = line.match(/\[Buffs → (.*?)\]/);
    if (!buffNameMatch) return false;
    
    const buffName = buffNameMatch[1];
    const buff = actor.items.find(i => 
        i.type === "buff" && 
        i.name === buffName && 
        i.system.buffType === "curse"
    );
    
    return !!buff;
}

Hooks.on("renderActorSheet", (app, html, data) => {
    if (!game.user.isGM) {
        // Hide curse buffs from non-GM users
        const buffRows = html.find('.item-list .item').filter((i, el) => {
            const itemId = el.dataset.itemId;
            const item = app.actor.items.get(itemId);
            return item?.system?.buffType === "curse";
        });
        buffRows.hide();

        // Filter curse buffs from tooltips and adjust displayed values
        html.find('.attribute.tooltip').each((i, element) => {
            const tooltipContent = element.querySelector('.tooltipcontent');
            if (tooltipContent) {
                const lines = tooltipContent.innerHTML.split('<br>');
                let curseModifier = 0;
                
                // Calculate total curse modifier and filter lines
                const filteredLines = lines.filter(line => {
                    if (line.includes('Buffs →') && isCurseBuff(app.actor, line)) {
                        const modMatch = line.match(/[+-]\d+/);
                        if (modMatch) {
                            curseModifier += parseInt(modMatch[0]);
                        }
                        return false; // Filter out curse buff lines
                    }
                    return true; // Keep all other lines
                });

                tooltipContent.innerHTML = filteredLines.join('<br>');

                // Only adjust the visible attribute if the setting is enabled
                if (game.settings.get('cursebuffs', 'adjustAttributes')) {
                    const valueSpan = element.querySelector('.attribute-value .large');
                    if (valueSpan && curseModifier !== 0) {
                        if (!valueSpan.hasAttribute('data-original-value')) {
                            valueSpan.setAttribute('data-original-value', valueSpan.textContent);
                            valueSpan.textContent = parseInt(valueSpan.textContent) - curseModifier;
                        }
                    }
                }
            }
        });
        return;
    }

    // Find the buffs tab
    const buffsTab = html.find('.tab[data-tab="buffs"]');
    if (!buffsTab.length) return;

    // Get curses
    const curses = app.actor.items.filter(i => 
        i.type === "buff" && 
        i.system.buffType === "curse"
    );

    // Create curse section
    const curseSection = `
        <div class="inventory-list">
            <li class="inventory-header flexrow">
                <h3 class="item-name flexrow gm-section">Curses (GM Only)</h3>
                <div class="item-detail item-timeline">Time left</div>
                <div class="item-detail item-level">Level</div>
                <div class="item-detail item-active">Active</div>
                <div class="item-controls">
                    <a class="item-control item-create" title="Create Curse">
                        <i class="fas fa-plus"></i> Add
                    </a>
                </div>
            </li>
            ${curses.map(curse => `
                <li class="item flexrow" data-item-id="${curse.id}">
                    <div class="item-name flexrow">
                        <div class="item-image" style="background-image: url('${curse.img}')"></div>
                        <h4>${curse.name}</h4>
                    </div>
                    <div class="item-detail item-timeline">
                        <span>${curse.system.timeline?.total || ""} rounds</span>
                    </div>
                    <div class="item-detail item-level">
                        <input type="text" value="${curse.system.level || ''}" data-dtype="Number"/>
                    </div>
                    <div class="item-detail item-active">
                        <label class="checkbox">
                            <input type="checkbox" class="stylized buff-toggle" ${curse.system.active ? 'checked' : ''}/>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="item-controls">
                        <a class="item-control item-edit" title="Edit Curse"><i class="fas fa-edit"></i></a>
                        <a class="item-control item-delete" title="Delete Curse"><i class="fas fa-trash"></i></a>
                    </div>
                </li>
            `).join('')}
        </div>
    `;

    // Add curse section after the last inventory list
    const lastList = buffsTab.find('.inventory-list').last();
    lastList.after(curseSection);

    // Add event listeners
    const curseList = lastList.next('.inventory-list');

    // Create new curse
    curseList.find('.item-create').click(async (ev) => {
        ev.preventDefault();
        const itemData = {
            name: "New Curse",
            type: "buff",
            img: "icons/svg/curse.svg",
            system: {
                buffType: "curse",
                hideFromToken: true,
                active: false
            }
        };
        const created = await app.actor.createEmbeddedDocuments("Item", [itemData]);
        created[0].sheet.render(true);
    });

    // Edit curse
    curseList.find('.item-edit').click(ev => {
        const li = ev.currentTarget.closest('.item');
        const item = app.actor.items.get(li.dataset.itemId);
        item.sheet.render(true);
    });

    // Delete curse
    curseList.find('.item-delete').click(async ev => {
        const li = ev.currentTarget.closest('.item');
        await app.actor.deleteEmbeddedDocuments("Item", [li.dataset.itemId]);
    });

    // Toggle curse active state
    curseList.find('.item input[type="checkbox"]').change(async ev => {
        const li = ev.currentTarget.closest('.item');
        const item = app.actor.items.get(li.dataset.itemId);
        await item.update({
            "system.active": ev.currentTarget.checked
        });
    });

    // Update curse level
    curseList.find('.item-detail.item-level input').change(async ev => {
        const li = ev.currentTarget.closest('.item');
        const item = app.actor.items.get(li.dataset.itemId);
        await item.update({
            "system.level": parseInt(ev.currentTarget.value) || 0
        });
    });
});

// Add a hook for updates to maintain the curse-adjusted values
Hooks.on("updateActor", (actor, changes, options, userId) => {
    if (!game.user.isGM) {
        // Re-render the sheet to maintain curse hiding
        actor.sheet.render(false);
    }
});

// Add to global scope for macro usage
window.CurseBuffs = {
    async createCurse(actor, curseData) {
        if (!game.user.isGM) {
            ui.notifications.warn("Only GMs can create curses");
            return;
        }

        const buffData = {
            name: curseData.name,
            type: "buff",
            img: curseData.img || "icons/svg/curse.svg",
            system: {
                buffType: "curse",
                hideFromToken: true,
                changes: curseData.changes || [],
                description: {
                    value: curseData.description || ""
                },
                duration: {
                    value: curseData.duration || null
                }
            }
        };

        return await actor.createEmbeddedDocuments("Item", [buffData]);
    }
};

// Hide curse buffs from token quick actions for non-GM users
Hooks.on("renderTokenHUD", (app, html, data) => {
    if (!game.user.isGM) {
        const items = app.object.actor?.items.filter(o => 
            o.type === "buff" && 
            o.system.buffType === "curse" && 
            o.system.active === true
        );
        
        if (items) {
            items.forEach(item => {
                html.find(`#buff-${item.id}`).remove();
            });
        }
    }
});