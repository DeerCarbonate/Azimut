try {
    Log.info("fortify-field 1");
    importClass(Packages.mindustry.ctype.ContentType);
    importClass(Packages.arc.util.Time);

    Log.info("fortify-field 2");
    const statuses = Vars.content.statusEffects();
    Log.info("statuses count: " + statuses.size);

    let fortified = null;
    for(let i = 0; i < statuses.size; i++){
        const s = statuses.get(i);
        if(s.name === "azimut-fortified"){
            fortified = s;
            break;
        }
    }
    Log.info("fortified: " + fortified);

    const units = Vars.content.units();
    let target = null;
    for(let i = 0; i < units.size; i++){
        const u = units.get(i);
        if(u.name === "azimut-fortification-drone"){
            target = u;
            break;
        }
    }
    Log.info("target: " + target);

    if(fortified && target){
        const FortifyFieldAbility = JavaAdapter(
            Packages.mindustry.entities.abilities.UnitAbility, {
            _timer: 0,
            update(unit) {
                this._timer += Time.delta;
                if(this._timer < 10) return;
                this._timer = 0;
                Groups.unit.each(ally => {
                    if(ally.team === unit.team && ally.dst(unit.x, unit.y) <= 83){
                        ally.apply(fortified, 120);
                    }
                });
            },
            copy() { return this; }
        });
        target.abilities.add(new FortifyFieldAbility());
        Log.info("FortifyField added!");
    } else {
        Log.warn("fortified=" + fortified + " target=" + target);
    }
} catch(e) {
    Log.err("fortify-field error: " + e);
}