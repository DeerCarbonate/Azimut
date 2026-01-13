// Надёжные ссылки на Java-классы
const Position = Packages.arc.math.geom.Position;
const Color = Packages.arc.graphics.Color;

const chainLightning = new Effect(25, 300, e => {
    // цель передаётся через e.data
    if(e.data == null) return;
    if(!(e.data instanceof Position)) return;

    const p = e.data;

    const tx = p.getX();
    const ty = p.getY();

    // направление на цель
    Tmp.v1.set(tx, ty).sub(e.x, e.y);
    const dst = Tmp.v1.len();

    if(dst <= 0.001) return;

    Tmp.v1.nor(); // unit vector to target

    // параметры “ломаности”
    const step = 6;                     // “частота” сегментов
    const links = Mathf.max(1, Mathf.ceil(dst / step));
    const spacing = dst / links;

    // перпендикуляр для бокового разброса
    Tmp.v2.set(-Tmp.v1.y, Tmp.v1.x);

    // цвет: белый -> e.color
    Draw.color(Color.white, e.color == null ? Color.white : e.color, e.fin());

    Lines.stroke(2.5 * e.fout());

    let x1 = e.x, y1 = e.y;

    for(let i = 1; i <= links; i++){
        // базовая точка вдоль линии
        let t = i * spacing;

        // шум: чем ближе к концам, тем меньше
        let amp = 3.0 * e.fout();
        let off = Mathf.range(amp);

        let x2 = e.x + Tmp.v1.x * t + Tmp.v2.x * off;
        let y2 = e.y + Tmp.v1.y * t + Tmp.v2.y * off;

        Lines.line(x1, y1, x2, y2);

        x1 = x2; y1 = y2;
    }

    Draw.reset();
});

module.exports = chainLightning;
