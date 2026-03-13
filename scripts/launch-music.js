const campMusic = Vars.tree.loadMusic("camp");
 
// Имя планеты — проверь точное название через Vars.content.planets()
// Обычно это "azimut-gelion" или "azimut-alveon"
const PLANET_NAME = "azimut-gelion";
 
var originalAmbient = null;
var originalDark = null;
var musicInjected = false;
 
Events.on(ClientLoadEvent, e => {
    // Добавляем музыку напрямую в плейлист планеты
    try {
        var planet = Vars.content.planets().find(p => p.name == PLANET_NAME);
        if (planet != null) {
            planet.ambientMusic.add(campMusic);
            Log.info("[CampMusic] Added camp music to " + planet.name);
        } else {
            Log.warn("[CampMusic] Planet not found: " + PLANET_NAME);
            // Вывести все планеты для дебага
            Vars.content.planets().each(p => Log.info("[CampMusic] Found planet: " + p.name));
        }
    } catch(err) {
        Log.err("[CampMusic] " + err);
    }
});
 