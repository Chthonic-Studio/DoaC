/*:
 * @plugindesc v1.0 Defines shop types and their items, prices, stock levels, and restocking rates. 
 * Adds restocking logic to shops based on time intervals or events.
 * @author Ulises Rubino
 *
 * @help
 * This plugin defines different shop types and their items, prices, stock levels,
 * and restocking rates. It also adds a mechanism to restock items based on time intervals.
 * 
 * Shop Types:
 * - Blacksmith: Sells weapons and armors.
 * - Bakery: Sells food items.
 * 
 * To set the shop type before opening the shop, use the plugin command:
 *   SetShopType [ShopType]
 * Example:
 *   SetShopType Blacksmith
 *
 * To manually trigger restocking, use the plugin command:
 *   RestockShops
 *
 * ============================================================================
 * Terms of Use
 * ============================================================================
 * Free for use in both commercial and non-commercial projects.
 * Please give credit to Ulises Rubino.
 * ============================================================================
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * Version 1.0:
 * - Initial release.
 * ============================================================================
 */

var ShopConfig = ShopConfig || {};

ShopConfig.Types = {
    Blacksmith: {
        items: [1, 2, 3], // Item IDs for weapons and armors
        basePrices: {
            1: 100, // Base price for item ID 1
            2: 200, // Base price for item ID 2
            3: 300  // Base price for item ID 3
        },
        stock: {
            1: 10,  // Initial stock for item ID 1
            2: 20,  // Initial stock for item ID 2
            3: 5    // Initial stock for item ID 3
        },
        restockRate: 1, // Restock every in-game day
        restockAmount: {
            1: 5,  // Restock amount for item ID 1
            2: 5,  // Restock amount for item ID 2
            3: 2   // Restock amount for item ID 3
        }
    },
    Bakery: {
        items: [4, 5, 6], // Item IDs for food items
        basePrices: {
            4: 50,  // Base price for item ID 4
            5: 30,  // Base price for item ID 5
            6: 20   // Base price for item ID 6
        },
        stock: {
            4: 50,  // Initial stock for item ID 4
            5: 40,  // Initial stock for item ID 5
            6: 30   // Initial stock for item ID 6
        },
        restockRate: 1, // Restock every in-game day
        restockAmount: {
            4: 10,  // Restock amount for item ID 4
            5: 5,   // Restock amount for item ID 5
            6: 5    // Restock amount for item ID 6
        }
    },
    General_Store: {
        items: [3, 4 , 5],
        basePrices: {
            3: 1,
            4: 1,
            5: 1
        },
        stock: {
            3: 100,
            4: 100,
            5: 100
        },
        restockRate: 1,
        restockAmount: {
            3: 10,
            4: 10,
            5: 20
        },
        Apothecary: {
            items: [7, 8, 9], // Item IDs for potions and medicines
            basePrices: {
                7: 50,  // Base price for item ID 7
                8: 100, // Base price for item ID 8
                9: 150  // Base price for item ID 9
            },
            stock: {
                7: 20,  // Initial stock for item ID 7
                8: 15,  // Initial stock for item ID 8
                9: 10   // Initial stock for item ID 9
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                7: 5,   // Restock amount for item ID 7
                8: 3,   // Restock amount for item ID 8
                9: 2    // Restock amount for item ID 9
            }
        },
        Fish_Shop: {
            items: [10, 11, 12], // Item IDs for fish
            basePrices: {
                10: 20, // Base price for item ID 10
                11: 30, // Base price for item ID 11
                12: 40  // Base price for item ID 12
            },
            stock: {
                10: 50, // Initial stock for item ID 10
                11: 40, // Initial stock for item ID 11
                12: 30  // Initial stock for item ID 12
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                10: 10, // Restock amount for item ID 10
                11: 8,  // Restock amount for item ID 11
                12: 6   // Restock amount for item ID 12
            }
        },
        Port: {
            items: [13, 14, 15], // Item IDs for ship supplies
            basePrices: {
                13: 50, // Base price for item ID 13
                14: 100, // Base price for item ID 14
                15: 150  // Base price for item ID 15
            },
            stock: {
                13: 20, // Initial stock for item ID 13
                14: 15, // Initial stock for item ID 14
                15: 10  // Initial stock for item ID 15
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                13: 5,   // Restock amount for item ID 13
                14: 3,   // Restock amount for item ID 14
                15: 2    // Restock amount for item ID 15
            }
        },
        Tavern: {
            items: [16, 17, 18], // Item IDs for drinks and food
            basePrices: {
                16: 10, // Base price for item ID 16
                17: 20, // Base price for item ID 17
                18: 30  // Base price for item ID 18
            },
            stock: {
                16: 50, // Initial stock for item ID 16
                17: 40, // Initial stock for item ID 17
                18: 30  // Initial stock for item ID 18
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                16: 10, // Restock amount for item ID 16
                17: 8,  // Restock amount for item ID 17
                18: 6   // Restock amount for item ID 18
            }
        },
        Farm: {
            items: [19, 20, 21], // Item IDs for crops and seeds
            basePrices: {
                19: 5,  // Base price for item ID 19
                20: 10, // Base price for item ID 20
                21: 15  // Base price for item ID 21
            },
            stock: {
                19: 100, // Initial stock for item ID 19
                20: 80,  // Initial stock for item ID 20
                21: 60   // Initial stock for item ID 21
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                19: 20, // Restock amount for item ID 19
                20: 15, // Restock amount for item ID 20
                21: 10  // Restock amount for item ID 21
            }
        },
        Crafting: {
            items: [22, 23, 24], // Item IDs for crafting materials
            basePrices: {
                22: 50, // Base price for item ID 22
                23: 100, // Base price for item ID 23
                24: 150  // Base price for item ID 24
            },
            stock: {
                22: 30, // Initial stock for item ID 22
                23: 25, // Initial stock for item ID 23
                24: 20  // Initial stock for item ID 24
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                22: 5,   // Restock amount for item ID 22
                23: 4,   // Restock amount for item ID 23
                24: 3    // Restock amount for item ID 24
            }
        },
        Smuggler: {
            items: [25, 26, 27], // Item IDs for contraband items
            basePrices: {
                25: 200, // Base price for item ID 25
                26: 300, // Base price for item ID 26
                27: 400  // Base price for item ID 27
            },
            stock: {
                25: 5,  // Initial stock for item ID 25
                26: 3,  // Initial stock for item ID 26
                27: 2   // Initial stock for item ID 27
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                25: 1,  // Restock amount for item ID 25
                26: 1,  // Restock amount for item ID 26
                27: 1   // Restock amount for item ID 27
            }
        },
        Caravan: {
            items: [28, 29, 30], // Item IDs for trade goods
            basePrices: {
                28: 100, // Base price for item ID 28
                29: 150, // Base price for item ID 29
                30: 200  // Base price for item ID 30
            },
            stock: {
                28: 10, // Initial stock for item ID 28
                29: 8,  // Initial stock for item ID 29
                30: 6   // Initial stock for item ID 30
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                28: 2,  // Restock amount for item ID 28
                29: 2,  // Restock amount for item ID 29
                30: 2   // Restock amount for item ID 30
            }
        },
        Specialty: {
            items: [31, 32, 33], // Item IDs for specialty items
            basePrices: {
                31: 500, // Base price for item ID 31
                32: 600, // Base price for item ID 32
                33: 700  // Base price for item ID 33
            },
            stock: {
                31: 3,  // Initial stock for item ID 31
                32: 3,  // Initial stock for item ID 32
                33: 3   // Initial stock for item ID 33
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                31: 1,  // Restock amount for item ID 31
                32: 1,  // Restock amount for item ID 32
                33: 1   // Restock amount for item ID 33
            }
        },
        Luxury: {
            items: [34, 35, 36], // Item IDs for luxury items
            basePrices: {
                34: 1000, // Base price for item ID 34
                35: 1200, // Base price for item ID 35
                36: 1500  // Base price for item ID 36
            },
            stock: {
                34: 2,  // Initial stock for item ID 34
                35: 2,  // Initial stock for item ID 35
                36: 2   // Initial stock for item ID 36
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                34: 1,  // Restock amount for item ID 34
                35: 1,  // Restock amount for item ID 35
                36: 1   // Restock amount for item ID 36
            }
        },
        Arcane_Shop: {
            items: [37, 38, 39], // Item IDs for magical items
            basePrices: {
                37: 2000, // Base price for item ID 37
                38: 2500, // Base price for item ID 38
                39: 3000  // Base price for item ID 39
            },
            stock: {
                37: 1,  // Initial stock for item ID 37
                38: 1,  // Initial stock for item ID 38
                39: 1   // Initial stock for item ID 39
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                37: 1,  // Restock amount for item ID 37
                38: 1,  // Restock amount for item ID 38
                39: 1   // Restock amount for item ID 39
            }
        },
        Armorer: {
            items: [40, 41, 42], // Item IDs for armor pieces
            basePrices: {
                40: 500, // Base price for item ID 40
                41: 600, // Base price for item ID 41
                42: 700  // Base price for item ID 42
            },
            stock: {
                40: 5,  // Initial stock for item ID 40
                41: 4,  // Initial stock for item ID 41
                42: 3   // Initial stock for item ID 42
            },
            restockRate: 1, // Restock every in-game day
            restockAmount: {
                40: 2,  // Restock amount for item ID 40
                41: 2,  // Restock amount for item ID 41
                42: 2   // Restock amount for item ID 42
            }
        }
    }
};
//=============================================================================
// Game_Temp
//=============================================================================

Game_Temp.prototype.setShopType = function(type) {
    this.shopType = type;
};

//=============================================================================
// Game_System
//=============================================================================

var _Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);
    this._shopRestockTimer = 0;
};

var _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
Game_System.prototype.onAfterLoad = function() {
    _Game_System_onAfterLoad.call(this);
    if (this._shopRestockTimer === undefined) {
        this._shopRestockTimer = 0;
    }
};

Game_System.prototype.updateRestockTimer = function() {
    this._shopRestockTimer++;
    if (this._shopRestockTimer >= 1440) { // Assuming 1 game minute per frame, restock every in-game day (1440 minutes)
        this._shopRestockTimer = 0;
        ShopConfig.restockAllShops();
    }
};

//=============================================================================
// ShopConfig
//=============================================================================

ShopConfig.restockAllShops = function() {
    for (var shopType in ShopConfig.Types) {
        if (ShopConfig.Types.hasOwnProperty(shopType)) {
            ShopConfig.restockShop(shopType);
        }
    }
};

ShopConfig.restockShop = function(shopType) {
    var shopConfig = ShopConfig.Types[shopType];
    if (!shopConfig) return;

    for (var itemId in shopConfig.restockAmount) {
        if (shopConfig.restockAmount.hasOwnProperty(itemId)) {
            var restockAmount = shopConfig.restockAmount[itemId];
            shopConfig.stock[itemId] = (shopConfig.stock[itemId] || 0) + restockAmount;
        }
    }
};

//=============================================================================
// Scene_Shop
//=============================================================================

var _Scene_Shop_prepare = Scene_Shop.prototype.prepare;
Scene_Shop.prototype.prepare = function(goods, purchaseOnly) {
    _Scene_Shop_prepare.call(this, goods, purchaseOnly);
    this._shopType = $gameTemp.shopType || 'General';
    this._shopConfig = ShopConfig.Types[this._shopType] || {};
};

Scene_Shop.prototype.doBuy = function(number) {
    var item = this._item;
    var price = this.adjustedBuyPrice(item);
    $gameParty.loseGold(price * number);
    $gameParty.gainItem(item, number);
    this.updateStock(item, -number);
};

Scene_Shop.prototype.doSell = function(number) {
    var item = this._item;
    var price = this.adjustedSellPrice(item);
    $gameParty.gainGold(price * number);
    $gameParty.loseItem(item, number);
    this.updateStock(item, number);
};

Scene_Shop.prototype.adjustedBuyPrice = function(item) {
    var basePrice = this._shopConfig.basePrices[item.id] || item.price;
    var stock = this._shopConfig.stock[item.id] || 0;
    var demand = this.calculateDemand(item);
    return Math.round(basePrice * demand / Math.max(1, stock));
};

Scene_Shop.prototype.adjustedSellPrice = function(item) {
    var basePrice = this._shopConfig.basePrices[item.id] || item.price;
    var stock = this._shopConfig.stock[item.id] || 0;
    var demand = this.calculateDemand(item);
    return Math.round(basePrice * 0.5 * Math.max(1, stock) / demand);
};

Scene_Shop.prototype.calculateDemand = function(item) {
    // Example calculation for demand; this can be customized
    return 1 + Math.random() * 0.5;
};

Scene_Shop.prototype.updateStock = function(item, amount) {
    var stock = this._shopConfig.stock[item.id] || 0;
    this._shopConfig.stock[item.id] = Math.max(0, stock + amount);
};

//=============================================================================
// Plugin Command
//=============================================================================

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'SetShopType') {
        $gameTemp.setShopType(args[0]);
    } else if (command === 'RestockShops') {
        ShopConfig.restockAllShops();
    }
};

//=============================================================================
// Scene_Map
//=============================================================================

var _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    $gameSystem.updateRestockTimer();
};