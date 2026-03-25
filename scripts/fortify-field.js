const StatusEffects = Java.type("mindustry.content.StatusEffects");
const Time = Java.type("arc.util.Time");
const UnitAbility = Java.type("mindustry.entities.abilities.UnitAbility");

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
                ally.apply(StatusEffects.fortified, 120);
            }
        });
    },

    copy() {
        const c = new FortifyFieldAbility();
        c.range = this.range;
        c.reload = this.reload;
        return c;
    }
});
const target = UnitTypes.find("azimut-fortification-drone")
if (target) {
    target.abilities.add(new FortifyFieldAbility());
}