const mech = Vars.content.getByName(ContentType.unit, "corea");

mech.update = unit => {
    if(!unit.isPlayer()) return;

    // направление движения
    let lookX = unit.x + Angles.trnsx(unit.rotation, 6);
    let lookY = unit.y + Angles.trnsy(unit.rotation, 6);

    let tile = Vars.world.tileWorld(lookX, lookY);

    if(tile && tile.block().solid){
        unit.boosting = true;
    }else{
        unit.boosting = false;
    }
};
