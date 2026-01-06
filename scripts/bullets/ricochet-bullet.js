const ricochetBullet = extend(BasicBulletType, {
    damage: 18,
    speed: 5,
    lifetime: 80,
    width: 7,
    height: 9,

    collidesAir: true,
    collidesGround: false,
    collidesTiles: false,

    maxRicochets: 3,
    searchRange: 120,

    hitEntity(b, entity, health){
        if(!(entity instanceof Unit)) return;
        if(entity.dead) return;

        // защита от мгновенного повторного попадания
        if(b.data?.ignore === entity.id) return;

        this.super$hitEntity(b, entity, health);

        if(b.data == null){
            b.data = {
                ricochets: 0,
                last: entity.id
            };
        }

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
                if(u.id === entity.id) return;

                let dst = u.dst(entity);
                if(dst < bestDst){
                    bestDst = dst;
                    target = u;
                }
            }
        );

        if(target != null){
            let angle = entity.angleTo(target);

            let nb = this.create(
                b.owner,
                b.team,
                entity.x,
                entity.y,
                angle
            );

            nb.data = {
                ricochets: b.data.ricochets + 1,
                last: entity.id,
                ignore: entity.id // ⛔ игнорируем первого юнита
            };

            // через 2 тика снимаем игнор
            Time.run(2, () => {
                if(nb && !nb.removed && nb.data){
                    nb.data.ignore = -1;
                }
            });
        }
    }
});

module.exports = ricochetBullet;
