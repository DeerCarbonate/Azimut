const ricochetBullet = extend(BasicBulletType, {
    speed: 4,
    damage: 35,
    lifetime: 80,
    width: 6,
    height: 8,
    pierce: false,
    hitSize: 4,

    maxRicochets: 3,
    searchRange: 120,

    hitEntity(b, entity, health){
        this.super$hitEntity(b, entity, health);

        if(b.data == null){
            b.data = { ricochets: this.maxRicochets };
        }

        if(b.data.ricochets <= 0) return;

        let target = null;
        let bestDst = this.searchRange;

        Units.nearbyEnemies(
            b.team,
            entity.x - this.searchRange,
            entity.y - this.searchRange,
            this.searchRange * 2,
            this.searchRange * 2,
            u => {
                if(u === entity || u.dead()) return;

                let dst = u.dst(entity);
                if(dst < bestDst){
                    bestDst = dst;
                    target = u;
                }
            }
        );

        if(target != null){
            let angle = Angles.angle(entity.x, entity.y, target.x, target.y);

            let nb = Bullet.create(
                this,
                b.owner,
                b.team,
                entity.x,
                entity.y,
                angle
            );

            nb.data = {
                ricochets: b.data.ricochets - 1
            };
        }
    }
});

module.exports = ricochetBullet;
