const PowerGenerator = Packages.mindustry.world.blocks.power.PowerGenerator;
const Mathf          = Packages.arc.math.Mathf;
const Time           = Packages.arc.util.Time;
const Category       = Packages.mindustry.world.meta.Category;
const ItemStack      = Packages.mindustry.type.ItemStack;

const ON_MIN  = 10 * 60;
const ON_MAX  = 30 * 60;
const OFF_MIN = 15 * 60;
const OFF_MAX = 80 * 60;
const RAMP    = 0.015;

const windTurbine = extend(PowerGenerator, {
    setStats() {
        this.super$setStats();
    }
});

windTurbine.name            = "azimut-wind-turbine";
windTurbine.size            = 1;
windTurbine.powerProduction = 0.2;
windTurbine.requirements(Category.power, ItemStack.with(Vars.content.item("azimut-cobalt"), 7));

windTurbine.buildType = () => extend(PowerGenerator.GeneratorBuild, {
    windTimer:  0,
    windActive: false,
    smoothEff:  0,

    created() {
        this.super$created();
        this.windTimer  = Mathf.random(5 * 60, OFF_MAX);
        this.windActive = false;
        this.smoothEff  = 0;
    },

    updateTile() {
        if (!this.enabled) {
            this.productionEfficiency = 0;
            return;
        }

        this.windTimer -= Time.delta;

        if (this.windTimer <= 0) {
            this.windActive = !this.windActive;
            this.windTimer = this.windActive
                ? Mathf.random(ON_MIN, ON_MAX)
                : Mathf.random(OFF_MIN, OFF_MAX);
        }

        this.smoothEff = Mathf.lerpDelta(
            this.smoothEff,
            this.windActive ? 1.0 : 0.0,
            RAMP
        );
        this.productionEfficiency = this.smoothEff;
    },

    write(write) {
        this.super$write(write);
        write.f(this.windTimer);
        write.bool(this.windActive);
        write.f(this.smoothEff);
    },

    read(read, revision) {
        this.super$read(read, revision);
        this.windTimer  = read.f();
        this.windActive = read.bool();
        this.smoothEff  = read.f();
    }
});