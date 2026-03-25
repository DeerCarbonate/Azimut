try {
    Log.info("fortify-field script started");

    const ContentType = Java.type("mindustry.ctype.ContentType");
    const Time = Java.type("arc.util.Time");
    const UnitAbility = Java.type("mindustry.entities.abilities.UnitAbility");

    Log.info("classes loaded");

    const fortified = Vars.content.getByName(ContentType.status, "azimut-fortified");
    Log.info("fortified: " + fortified);

    const target = UnitTypes.find("azimut-fortification-drone");
    Log.info("target: " + target);

    if (fortified && target) {
        const FortifyFieldAbility = JavaAdapter(UnitAbility, {
            range: 83,
            reload: 10,
            _timer: 0,
            update(unit) {
                this._timer += Time.delta;
                if (this._timer < this.reload) return;
                this._timer = 0;
                Groups.unit.each(ally => {
                    if (ally.team === unit.team && ally.dst(unit.x, unit.y) <= this.range) {
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