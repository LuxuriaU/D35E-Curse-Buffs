# D35E Curse Buffs

A module for the D35E (3.5 SRD) system in Foundry VTT that adds support for curse-type buffs that are hidden from players.

## Features

- Adds a new "Curse" buff type that is only visible to GMs
- Hides curse effects from player character sheets
- Filters curse-related tooltips from players
- Optional experimental attribute value adjustment (can be toggled in settings)
- GM-only curse management section in character sheets

## Installation

1. Copy this URL: `https://raw.githubusercontent.com/LuxuriaU/D35E-Curse-Buffs/main/module.json`
2. Open Foundry VTT
3. Navigate to Add-on Modules
4. Click "Install Module"
5. Paste the URL and click "Install"


## Usage

### For GMs
- Create curses through the new "Curses (GM Only)" section in the Buffs tab
- Curses function like normal buffs but are hidden from players
- Players cannot see or interact with curse effects

<details>
<summary>GM View Screenshots</summary>

#### GM Curse Management Interface
![GM Curse Management](https://github.com/user-attachments/assets/ce483667-2166-4cae-b251-4ab5dd3ff24e)

#### GM Buff Window View with Curse Effects
![GM Attribute View](https://github.com/user-attachments/assets/a9f63f76-7793-49b1-9622-7df43fca394e)

#### GM Tooltip Display
![GM Tooltip](https://github.com/user-attachments/assets/12c75b4b-a5b0-44fa-8a1d-a9c97ae7d72e)

</details>

### For Players
- Curse effects are hidden from the buffs list
- Tooltips are filtered to remove curse-related information
- Attribute values can be adjusted to hide curse effects (optional setting)

<details>
<summary>Player View Screenshots</summary>

#### Player Buff window View (Curse Effects Hidden)
![Player Attribute View](https://github.com/user-attachments/assets/dae66906-23b5-4a8e-b425-d2c509689172)

#### Player Tooltip Display (Filtered)
![Player Tooltip](https://github.com/user-attachments/assets/cffe6a46-8085-421a-a6c7-579426796444)

</details>


## Known Limitations

- Attribute value adjustments may be inconsistent when:
  - Multiple curses affect the same attribute
  - The buffs are changed or edited in realtime (a player is logged in), fixed with reloading player clients (not ideal)
- The module currently only hides visual elements and tooltips; some system calculations may still reveal curse effects
- Some parts of a tooltip may still show the true absolute value.

## Settings

- **Adjust Attribute Display**: When enabled, visually adjusts attribute values to hide curse effects from players. When disabled, only tooltips are filtered.

## Compatibility

- Requires D35E system version 2.4.3
- Foundry VTT Core Compatible Version: 11

## Support

For issues and feature requests, please use the [Issue Tracker](https://github.com/LuxuriaU/D35E-Curse-Buffs/issues)

## Credits

Created by Luxuria_Unus
