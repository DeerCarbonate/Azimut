try {
    Log.info("fortify-field 1");
    importClass(Packages.arc.util.Time);
    Log.info("fortify-field 2");

    const FortifyFieldAbility = extend(Packages.mindustry.entities.abilities.UnitAbility, {
        _timer: 0,
        update(unit) {
            this._timer += Time.delta;
            if(this._timer < 10) return;
            this._timer = 0;
            Groups.unit.each(ally => {
                if(ally.team === unit.team && ally.dst(unit.x, unit.y) <= 83){
                    const eff = Vars.content.statusEffects().find(s => s.name === "azimut-fortified");
                    if(eff) ally.apply(eff, 120);
                }
            });
        },
        copy() { return this; }
    });

    Log.info("fortify-field 3");

    const units = Vars.content.units();
    for(let i = 0; i < units.size; i++){
        if(units.get(i).name === "azimut-fortification-drone"){
            units.get(i).abilities.add(new FortifyFieldAbility());
            Log.info("FortifyField added!");
            break;
        }
    }
} catch(e) {
    Log.err("fortify-field error: " + e);
}