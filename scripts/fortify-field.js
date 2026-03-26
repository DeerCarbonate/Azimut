try {
    Log.info("fortify-field 1");

    const UnitUpdateEvent = Packages.mindustry.game.EventType.UnitUpdateEvent;
    Log.info("fortify-field 2");

    let fortified = null;

    Events.on(UnitUpdateEvent, e => {
        const unit = e.unit;
        if(unit.type.name !== "azimut-fortification-drone") return;

        if(!fortified){
            fortified = Vars.content.statusEffects().find(s => s.name === "azimut-fortified");
            if(!fortified) return;
        }

        if(unit.timer.get(5, 10)){
            Groups.unit.each(ally => {
                if(ally.team === unit.team && ally.dst(unit.x, unit.y) <= 83){
                    ally.apply(fortified, 120);
                }
            });
        }
    });

    Log.info("fortify-field ready!");
} catch(e) {
    Log.err("fortify-field error: " + e);
}