const ricochetBullet = extend(BasicBulletType, {
    damage: 18,
    speed: 5,
    lifetime: 80,
    width: 7,
    height: 9,

    // рикошеты
    maxRicochets: 3,
    searchRange: 120,

    hitEntity(b, entity, health){
        // защита: работаем ТОЛЬКО с юнитами
        if(!(entity instanceof Unit)) return;

        this.super$hitEntity(b, entity, health);

        // если рикошеты закончились
        if(b.data == null) b.data = {ricochets: 0};
        if(b.data.ricochets >= this.maxRicochets) return;

        let target = null;
        let bestDst = this.searchRange;

        Units.nearbyEnemies(
            b.team,
            entity.x - this.searchRange,
            entity.y - this.searchRange,
            this.searchRange * 2,
            this.searchRange * 2,
            u => {
                if(u.dead) return;
                if(u === entity) return;

                let dst = u.dst(entity);
                if(dst < bestDst){
                    bestDst = dst;
                    target = u;
                }
            }
        );

        if(target != null){
            // создаём новый снаряд
            let angle = entity.angleTo(target);

            this.create(
                b.owner,
                b.team,
                entity.x,
                entity.y,
                angle
            );

            b.data.ricochets++;
        }
    }
});

module.exports = ricochetBullet;
