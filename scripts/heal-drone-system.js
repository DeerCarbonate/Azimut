// ─── Настройки ────────────────────────────────────────────────
const STATION_NAME = "azimut-heal-station"; // ← имя твоего блока (файл без .hjson)
const DRONE_NAME   = "heal-drone";
const MAX_DRONES   = 3;
const RANGE        = 150 * 8;  // радиус станции в world units
const ORBIT_R      = 28;       // радиус орбиты вокруг цели
const ORBIT_SPD    = 2.6;      // градусов в тик
const HEAL_PT      = 22;       // HP в тик (основной хил через JS)
const CHECK_INT    = 40;       // тики между поиском цели
// ──────────────────────────────────────────────────────────────

const S = { seek: 0, fly: 1, orbit: 2, ret: 3 };
const ds = new java.util.HashMap(); // unit → state object

let _dtype = null;
function dtype() {
    return _dtype || (_dtype = Vars.content.unit(DRONE_NAME));
}

// Возвращает/создаёт state для дрона
function getDs(unit, station) {
    if (!ds.containsKey(unit)) {
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

function ok(e) {
    return e != null && !e.dead;
}

// Ближайшая станция к юниту
function nearSta(unit) {
    let best = null, bd = 1e9;
    Groups.build.each(b => {
        if (!b.block || b.block.name !== STATION_NAME
            || b.team !== unit.team || b.dead) return;
        let d = Mathf.dst(unit.x, unit.y, b.x, b.y);
        if (d < bd) { bd = d; best = b; }
    });
    return best;
}

// Самая повреждённая цель в радиусе станции
function findTgt(sta) {
    let best = null, bs = 0;
    Units.nearby(sta.team, sta.x, sta.y, RANGE, u => {
        let s = u.maxHealth - u.health;
        if (s > bs) { bs = s; best = u; }
    });
    Vars.indexer.eachBlock(
        sta.team, sta.x, sta.y, RANGE,
        b => b.health < b.maxHealth,
        b => {
            let s = b.maxHealth - b.health;
            if (s > bs) { bs = s; best = b; }
        }
    );
    return best;
}

// ─── AI ───────────────────────────────────────────────────────
const mkAI = () => extend(AIController, {
    updateMovement() {
        const u = this.unit;
        const d = getDs(u);
        d.t++;

        // Привязать к станции
        if (!ok(d.sta)) d.sta = nearSta(u);
        if (!ok(d.sta)) { ds.remove(u); u.kill(); return; }
        const sta = d.sta;

        // SEEK — кружим возле станции в ожидании цели
        if (d.mode === S.seek) {
            let ox = sta.x + Math.cos(d.t * 0.04) * 20;
            let oy = sta.y + Math.sin(d.t * 0.04) * 20;
            this.moveTo(Tmp.v1.set(ox, oy), 3, 0.07);

            if (d.t % CHECK_INT === 0) {
                let t = findTgt(sta);
                if (t) { d.tgt = t; d.mode = S.fly; }
            }

        // FLY — летим к цели
        } else if (d.mode === S.fly) {
            if (!ok(d.tgt) || d.tgt.health >= d.tgt.maxHealth) {
                d.tgt = findTgt(sta);
                if (!d.tgt) { d.mode = S.seek; return; }
            }
            if (Mathf.dst(u.x, u.y, d.tgt.x, d.tgt.y) <= ORBIT_R + 5) {
                d.ang = Angles.angle(d.tgt.x, d.tgt.y, u.x, u.y);
                d.mode = S.orbit;
            } else {
                this.moveTo(Tmp.v1.set(d.tgt.x, d.tgt.y), ORBIT_R, 0.1);
            }

        // ORBIT — крутимся вокруг цели, хилим
        } else if (d.mode === S.orbit) {
            if (!ok(d.tgt)) {
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

            // Хил
            d.tgt.heal(HEAL_PT * Time.delta);

            // Цель вылечена — искать следующую или возвращаться
            if (d.tgt.health >= d.tgt.maxHealth) {
                d.tgt = findTgt(sta);
                d.mode = d.tgt ? S.fly : S.ret;
            }

        // RETURN — летим к станции и деспавнимся
        } else if (d.mode === S.ret) {
            if (Mathf.dst(u.x, u.y, sta.x, sta.y) < 10) {
                ds.remove(u);
                u.kill();
                return;
            }
            this.moveTo(Tmp.v1.set(sta.x, sta.y), 6, 0.1);

            // Появились новые цели — разворачиваемся
            if (d.t % CHECK_INT === 0) {
                let t = findTgt(sta);
                if (t) { d.tgt = t; d.mode = S.fly; }
            }
        }
    }
});

// ─── Перехват создания (включая UnitCargoLoader) ──────────────
Events.on(UnitCreateEvent, e => {
    if (!e.unit || e.unit.type !== dtype()) return;
    // Назначаем наш AI (переопределяем CargoAI)
    e.unit.controller(mkAI());
    // Регистрируем в таблице если ещё нет
    if (!ds.containsKey(e.unit)) {
        getDs(e.unit, nearSta(e.unit));
    }
});

// ─── Менеджер пула: держим 3 дрона на станцию ────────────────
Events.run(Trigger.update, () => {
    if (Vars.state.isMenu() || !dtype()) return;
    // Проверяем раз в 2 секунды
    if (!Timer.instance().get(4, 120)) return;

    Groups.build.each(b => {
        if (!b.block || b.block.name !== STATION_NAME || b.dead) return;

        // Считаем живых дронов этой станции
        let count = 0;
        Groups.unit.each(u => {
            if (u.type !== dtype() || u.team !== b.team) return;
            let d = ds.get(u);
            if (d && d.sta === b) count++;
        });

        // Спавним недостающих
        for (let i = count; i < MAX_DRONES; i++) {
            let drone = dtype().create(b.team);
            drone.set(b.x + Mathf.range(10), b.y + Mathf.range(10));
            drone.rotation = Mathf.random(360);
            // Регистрируем ДО add(), чтобы UnitCreateEvent не перезаписал station
            getDs(drone, b);
            drone.controller(mkAI());
            if (!Vars.net.client()) drone.add();
        }
    });
});