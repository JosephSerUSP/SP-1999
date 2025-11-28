import { $dataLootTable } from '../data/data.js';
import { Game_Item, Game_Weapon, Game_Armor } from './entities.js';

/**
 * Manages item generation and handling.
 */
export class ItemManager {
    /**
     * Generates a random piece of loot based on the current floor.
     * @param {number} floor - The current floor level.
     * @returns {Game_Item|Game_Weapon|Game_Armor} The generated item.
     */
    static generateLoot(floor) {
        const roll = Math.random();
        if (roll < 0.4) {
            const item = $dataLootTable.items[Math.floor(Math.random() * $dataLootTable.items.length)];
            return new Game_Item(item);
        } else if (roll < 0.7) {
            const base = $dataLootTable.weapons[Math.floor(Math.random() * $dataLootTable.weapons.length)];
            const pre = $dataLootTable.prefixes[Math.min(Math.floor(Math.random() * (floor + 2)), $dataLootTable.prefixes.length-1)];
            return new Game_Weapon(base, pre);
        } else {
            const base = $dataLootTable.armors[Math.floor(Math.random() * $dataLootTable.armors.length)];
            return new Game_Armor(base);
        }
    }
}
