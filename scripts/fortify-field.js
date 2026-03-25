// fortify-field.js
const ContentType = Java.type("mindustry.ctype.ContentType");
const Time = Java.type("arc.util.Time");
const UnitAbility = Java.type("mindustry.entities.abilities.UnitAbility");

const fortified = Vars.content.getByName(ContentType.status, "azimut-fortified");
Log.info("fortified status: " + fortified);

const target = UnitTypes.find("azimut-fortification-drone");
Log.info("target unit: " + target);

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
}