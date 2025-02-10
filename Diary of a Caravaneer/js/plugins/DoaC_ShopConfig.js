/*:
 * @plugindesc v1.0 Configurable shop system with dynamic pricing and restocking logic. 
 * Allows configuration through the Plugin Manager and event comments.
 * @author YourName
 *
 * @param ShopTypes
 * @type struct<ShopType>[]
 * @desc Define the different types of shops and their items, stock levels, and restocking rates.
 * @default []
 *
 * @help
 * This plugin defines different shop types and their items, stock levels, restocking rates, 
 * and includes a mechanism to dynamically calculate buy and sell prices.
 * 
 * Shop Types are configured through the Plugin Manager. Each shop type can have its own 
 * set of items, initial stock levels, base prices, restock rates, and restock amounts.
 * 
 * Prices are calculated using the following formulas:
 * Buy Price = Base Price * (Location Demand + Location Economic Power) * Event Modifiers * Stock Modifier
 * Sell Price = Base Price * (1 / (Location Demand + Location Economic Power)) * Event Modifiers * Inverse Stock Modifier
 * 
 * Location Demand, Location Economic Power, and Event Modifiers are variables specified 
 * through event comments in each shop.
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
 * Please give credit to YourName.
 * ============================================================================
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * Version 1.0:
 * - Initial release.
 * ============================================================================
 */

/*~struct~ShopType:
 * @param name
 * @type text
 * @desc Name of the shop type.
 * @default Shop
 *
 * @param items
 * @type struct<Item>[]
 * @desc List of items sold in the shop.
 * @default []
 *
 * @param restockRate
 * @type number
 * @desc Restock rate in days.
 * @default 1
 *
 * @param restockAmount
 * @type number
 * @desc Percentage of each item's base stock to restock.
 * @default 30
 *
 * @param economicPowerVar
 * @type variable
 * @desc Variable ID for the Location Economic Power.
 * @default 1
 *
 * @param eventModifiersVar
 * @type variable
 * @desc Variable ID for the Event Modifiers.
 * @default 2
 */

/*~struct~Item:
 * @param id
 * @type number
 * @desc ID of the item.
 * @default 1
 *
 * @param baseStock
 * @type number
 * @desc Base stock of the item.
 * @default 10
 *
 * @param demandVar
 * @type variable
 * @desc Variable ID for the Location Demand of the item.
 * @default 3
 */

var ShopConfig = ShopConfig || {};

//=============================================================================
// Plugin Parameters
//=============================================================================

ShopConfig.Parameters = PluginManager.parameters('DoaC_ShopConfig');
ShopConfig.ShopTypes = JSON.parse(ShopConfig.Parameters['ShopTypes'] || '[]').map(JSON.parse);

ShopConfig.Types = ShopConfig.ShopTypes.reduce((acc, shopType) => {
    acc[shopType.name] = {
        items: shopType.items.map(item => ({
            id: Number(item.id),
            baseStock: Number(item.baseStock),
            stock: Number(item.baseStock),
            demandVar: Number(item.demandVar)
        })),
        restockRate: Number(shopType.restockRate),
        restockAmount: Number(shopType.restockAmount),
        economicPowerVar: Number(shopType.economicPowerVar),
        eventModifiersVar: Number(shopType.eventModifiersVar)
    };
    return acc;
}, {});

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
    this._shopRestockTimers = {};
};

var _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
Game_System.prototype.onAfterLoad = function() {
    _Game_System_onAfterLoad.call(this);
    if (this._shopRestockTimers === undefined) {
        this._shopRestockTimers = {};
    }
};

Game_System.prototype.updateRestockTimers = function() {
    for (var shopType in this._shopRestockTimers) {
        if (this._shopRestockTimers.hasOwnProperty(shopType)) {
            this._shopRestockTimers[shopType]++;
            var restockRate = ShopConfig.Types[shopType].restockRate;
            var restockTimerVar = $gameVariables.value($gameMap.event($gameTemp._eventId).event().meta.restockTimerVar) || restockRate;
            if (this._shopRestockTimers[shopType] >= restockTimerVar) {
                this._shopRestockTimers[shopType] = 0;
                ShopConfig.restockShop(shopType);
            }
        }
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

    var restockModifierVar = $gameVariables.value($gameMap.event($gameTemp._eventId).event().meta.restockAmountModifierVar);
    var restockModifier = restockModifierVar ? $gameVariables.value(restockModifierVar) : 1;

    shopConfig.items.forEach(item => {
        item.stock += Math.round(item.baseStock * (shopConfig.restockAmount / 100) * restockModifier);
    });
};

//=============================================================================
// Scene_Shop
//=============================================================================

var _Scene_Shop_prepare = Scene_Shop.prototype.prepare;
Scene_Shop.prototype.prepare = function(goods, purchaseOnly) {
    _Scene_Shop_prepare.call(this, goods, purchaseOnly);
    this._shopType = $gameTemp.shopType || 'General';
    this._shopConfig = ShopConfig.Types[this._shopType] || {};
    if (!$gameSystem._shopRestockTimers[this._shopType]) {
        $gameSystem._shopRestockTimers[this._shopType] = 0;
    }
};

Scene_Shop.prototype.doBuy = function(number) {
    var item = this._item;
    var price = this.adjustedBuyPrice(item);
    $gameParty.loseGold(price * number);
    $gameParty.gainItem(item, number);
    this.updateStock(item, -number);

    // Update Location Economic Power
    var economicPowerVar = this._shopConfig.economicPowerVar;
    var economicPowerIncrease = price * number * 0.01;
    $gameVariables.setValue(economicPowerVar, $gameVariables.value(economicPowerVar) + economicPowerIncrease);

    // Update Location Demand
    var demandVar = this._shopConfig.items.find(i => i.id === item.id).demandVar;
    var baseStock = this._shopConfig.items.find(i => i.id === item.id).baseStock;
    var remainingStock = this._shopConfig.items.find(i => i.id === item.id).stock;
    var demandIncrease = Math.min(100, 100 * ((baseStock - remainingStock) / baseStock));
    $gameVariables.setValue(demandVar, demandIncrease);
};

Scene_Shop.prototype.doSell = function(number) {
    var item = this._item;
    var price = this.adjustedSellPrice(item);
    $gameParty.gainGold(price * number);
    $gameParty.loseItem(item, number);
    this.updateStock(item, number);
};

Scene_Shop.prototype.adjustedBuyPrice = function(item) {
    var basePrice = item.price;
    var stock = this._shopConfig.items.find(i => i.id === item.id).stock || 1;
    var demand = $gameVariables.value($gameMap.event(this._eventId).event().meta.locationDemandVar) || 1;
    var economicPower = $gameVariables.value($gameMap.event(this._eventId).event().meta.locationEconomicPowerVar) || 1;
    var eventModifiers = $gameVariables.value($gameMap.event(this._eventId).event().meta.eventModifiersVar) || 1;
    var stockModifier = 1 + (10 / (stock + 1));
    return Math.round(basePrice * (demand + economicPower) * eventModifiers * stockModifier);
};

Scene_Shop.prototype.adjustedSellPrice = function(item) {
    var basePrice = item.price;
    var stock = this._shopConfig.items.find(i => i.id === item.id).stock || 1;
    var demand = $gameVariables.value($gameMap.event(this._eventId).event().meta.locationDemandVar) || 1;
    var economicPower = $gameVariables.value($gameMap.event(this._eventId).event().meta.locationEconomicPowerVar) || 1;
    var eventModifiers = $gameVariables.value($gameMap.event(this._eventId).event().meta.eventModifiersVar) || 1;
    var inverseStockModifier = 1 + (10 / (this._shopConfig.items.find(i => i.id === item.id).baseStock - stock + 1));
    var sellPrice = Math.round(basePrice * (1 / (demand + economicPower)) * eventModifiers * inverseStockModifier);
    return Math.min(sellPrice, this.adjustedBuyPrice(item));
};

Scene_Shop.prototype.updateStock = function(item, amount) {
    var shopItem = this._shopConfig.items.find(i => i.id === item.id);
    if (shopItem) {
        shopItem.stock = Math.max(0, shopItem.stock + amount);
    }
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
    $gameSystem.updateRestockTimers();
};
