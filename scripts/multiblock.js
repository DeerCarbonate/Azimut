const rotateBlocks = [
    "azimut-mixing-chamber-base",
    "azimut-mixing-chamber-top"
    // добавляй сюда другие блоки
];

Events.on(ContentInitEvent, e => {
    rotateBlocks.forEach(function(name) {
        var block = Vars.content.block(name);
        if(block == null) {
            Log.warn("[MultiRotate] Block not found: " + name);
            return;
        }

        block.rotate = true;

        // Кэшируем регионы для каждого поворота при старте
        var baseRegion    = Core.atlas.find(name,          Core.atlas.find("error"));
        var rot1Region    = Core.atlas.find(name + "-rot1", baseRegion);
        var rot2Region    = Core.atlas.find(name + "-rot2", baseRegion);
        var rot3Region    = Core.atlas.find(name + "-rot3", baseRegion);

        var regions = [baseRegion, rot1Region, rot2Region, rot3Region];

        // Подменяем метод draw у building'а
        var prevBuildType = block.buildType;
        block.buildType = extend(Building, prevBuildType.get(), {
            draw: function() {
                // Рисуем нужный регион без поворота (спрайт уже правильный)
                var region = regions[this.rotation % 4];
                Draw.rect(region, this.x, this.y);

                // Вызываем остальные drawers (жидкости, тепло, overlay и т.д.)
                // кроме DrawDefault — он рисует базовый регион который мы уже подменили
                var drawers = this.block.drawer.drawers;
                if(drawers != null) {
                    for(var i = 0; i < drawers.size; i++) {
                        var d = drawers.get(i);
                        if(!(d instanceof DrawDefault)) {
                            d.draw(this);
                        }
                    }
                }
            }
        });

        Log.info("[MultiRotate] Patched: " + name);
    });
});