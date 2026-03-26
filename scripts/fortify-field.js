try {
    Log.info("fortify-field 1");
    importClass(Packages.arc.util.Time);
    importClass(Packages.mindustry.entities.abilities.EnergyFieldAbility);
    Log.info("fortify-field 2");

    const FortifyFieldAbility = extend(EnergyFieldAbility, {
        update(unit) {
            this.super$update(unit);
            Groups.unit.each(ally => {
                if(ally.team === unit.team && ally.dst(unit.x, unit.y) <= 83){
                    const eff = Vars.content.statusEffects().find(s => s.name === "azimut-fortified");
                    if(eff) ally.apply(eff, 120);
                }
            });
        }
    });

    Log.info("fortify-field 3");
    const inst = new FortifyFieldAbility();
    inst.range = 83;
    inst.reload = 10;
    inst.damage = 20;
    inst.maxTargets = 7;
    inst.healPercent = 0.1;

    const units = Vars.content.units();
    for(let i = 0; i < units.size; i++){
        if(units.get(i).name === "azimut-fortification-drone"){
            units.get(i).abilities.add(inst);
            Log.info("FortifyField added!");
            break;
        }
    }
} catch(e) {
    Log.err("fortify-field error: " + e);
}