const ContentType = Java.type("mindustry.ctype.ContentType");
const Time = Java.type("arc.util.Time");
const UnitAbility = Java.type("mindustry.entities.abilities.UnitAbility");

Events.on(ClientLoadEvent, () => {
    const fortified = Vars.content.getByName(ContentType.status, "azimut-fortified");
    if (!fortified) { Log.warn("azimut-fortified status not found!"); return; }

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

        copy() {
            return this;
        }
    });

    const target = UnitTypes.find("azimut-fortification-drone");
    if (!target) { Log.warn("azimut-fortification-drone not found!"); return; }
    target.abilities.add(new FortifyFieldAbility());
    Log.info("FortifyField ability added!");
});