const STATION_NAME = "azimut-swarm-repair-station";
const DRONE_NAME   = "azimut-swarmer";
const MAX_DRONES   = 3;
const RANGE        = 150 * 8;
const ORBIT_R      = 28;
const ORBIT_SPD    = 2.6;
const HEAL_PT      = 22;
const CHECK_INT    = 40;

const S = { seek: 0, fly: 1, orbit: 2, ret: 3 };
const ds = new java.util.HashMap();
let _tick = 0;

let _dtype = null;
function dtype() {
    return _dtype || (_dtype = Vars.content.unit(DRONE_NAME));
}

function getDs(unit, station) {
    if(!ds.containsKey(unit)) {
        ds.put(unit, {
            mode: S.seek,
            tgt: null,
            ang: Mathf.random(360),
            sta: station || null,
            t: ~~(Math.random() * 1000)
        });
    }
    return ds.get(unit);
}

function ok(e) { return e != null && !e.dead; }

function nearSta(unit) {
    let best = null, bd = 1e9;
    Groups.build.each(b => {
        if(!b.block || b.block.name !== STATION_NAME
            || b.team !== unit.team || b.dead) return;
        let d = Mathf.dst(unit.x, unit.y, b.x, b.y);
        if(d < bd) { bd = d; best = b; }
    });
    return best;
}

function findTgt(sta) {
    let best = null, bs = 0;
    Units.nearby(sta.team, sta.x, sta.y, RANGE, u => {
        if(u.type === dtype()) return;
        let s = u.maxHealth - u.health;
        if(s > bs) { bs = s; best = u; }
    });
    Vars.indexer.eachBlock(
        sta.team, sta.x, sta.y, RANGE,
        b => b.health < b.maxHealth,
        b => {
            let s = b.maxHealth - b.health;
            if(s > bs) { bs = s; best = b; }
        }
    );
    return best;
}

const mkAI = () => extend(AIController, {
    updateMovement() {
        const u = this.unit;
        const d = getDs(u);
        d.t++;

        if(!ok(d.sta)) d.sta = nearSta(u);
        if(!ok(d.sta)) { ds.remove(u); u.kill(); return; }
        const sta = d.sta;

        if(d.mode === S.seek) {
            let ox = sta.x + Math.cos(d.t * 0.04) * 20;
            let oy = sta.y + Math.sin(d.t * 0.04) * 20;
            this.moveTo(Tmp.v1.set(ox, oy), 3, 0.07);
            if(d.t % CHECK_INT === 0) {
                let t = findTgt(sta);
                if(t) { d.tgt = t; d.mode = S.fly; }
            }

        } else if(d.mode === S.fly) {
            if(!ok(d.tgt) || d.tgt.health >= d.tgt.maxHealth) {
                d.tgt = findTgt(sta);
                if(!d.tgt) { d.mode = S.seek; return; }
            }
            if(Mathf.dst(u.x, u.y, d.tgt.x, d.tgt.y) <= ORBIT_R + 5) {
                d.ang = Angles.angle(d.tgt.x, d.tgt.y, u.x, u.y);
                d.mode = S.orbit;
            } else {
                this.moveTo(Tmp.v1.set(d.tgt.x, d.tgt.y), ORBIT_R, 0.1);
            }

        } else if(d.mode === S.orbit) {
            if(!ok(d.tgt)) {
                d.tgt = findTgt(sta);
                d.mode = d.tgt ? S.fly : S.ret;
                return;
            }
            d.ang = (d.ang + ORBIT_SPD * Time.delta) % 360;
            let ox = d.tgt.x + Angles.trnsx(d.ang, ORBIT_R);
            let oy = d.tgt.y + Angles.trnsy(d.ang, ORBIT_R);
            this.moveTo(Tmp.v1.set(ox, oy), 3, 0.15);
            u.rotation = Mathf.slerpDelta(
                u.rotation,
                Angles.angle(u.x, u.y, d.tgt.x, d.tgt.y),
                0.1
            );
            d.tgt.heal(HEAL_PT * Time.delta);
            if(d.tgt.health >= d.tgt.maxHealth) {
                d.tgt = findTgt(sta);
                d.mode = d.tgt ? S.fly : S.ret;
            }

        } else if(d.mode === S.ret) {
            if(Mathf.dst(u.x, u.y, sta.x, sta.y) < 10) {
                ds.remove(u);
                u.kill();
                return;
            }
            this.moveTo(Tmp.v1.set(sta.x, sta.y), 6, 0.1);
            if(d.t % CHECK_INT === 0) {
                let t = findTgt(sta);
                if(t) { d.tgt = t; d.mode = S.fly; }
            }
        }
    }
});

Events.on(UnitCreateEvent, e => {
    if(!e.unit || e.unit.type !== dtype()) return;
    e.unit.controller(mkAI());
    if(!ds.containsKey(e.unit)) {
        getDs(e.unit, nearSta(e.unit));
    }
});

Events.run(Trigger.update, () => {
    if(Vars.state.isMenu() || !dtype()) return;
    _tick++;
    if(_tick % 120 !== 0) return;

    Groups.build.each(b => {
        if(!b.block || b.block.name !== STATION_NAME || b.dead) return;

        let count = 0;
        Groups.unit.each(u => {
            if(u.type !== dtype() || u.team !== b.team) return;
            let d = ds.get(u);
            if(d && d.sta === b) count++;
        });

        for(let i = count; i < MAX_DRONES; i++) {
            let drone = dtype().create(b.team);
            drone.set(b.x + Mathf.range(10), b.y + Mathf.range(10));
            drone.rotation = Mathf.random(360);
            getDs(drone, b);
            drone.controller(mkAI());
            if(!Vars.net.client()) drone.add();
        }
    });
});