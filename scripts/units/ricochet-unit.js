const ricochetBullet = require("bullets/ricochet-bullet");

const ricochetUnit = extend(UnitType, "ricochet-unit", {});

ricochetUnit.constructor = () => extend(UnitEntity, {});

ricochetUnit.weapons.add(
    (() => {
        let w = new Weapon("ricochet-weapon");
        w.reload = 35;
        w.x = 0;
        w.y = 4;
        w.shootY = 6;
        w.rotate = true;
        w.mirror = false;
        w.bullet = ricochetBullet;
        w.inaccuracy = 2;
        return w;
    })()
);

module.exports = ricochetUnit;
