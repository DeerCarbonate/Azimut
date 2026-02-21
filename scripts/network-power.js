// scripts/network-power.js
const Vars = Packages.mindustry.Vars;
const ContentType = Packages.mindustry.ctype.ContentType;
const CoreBlock = Packages.mindustry.world.blocks.storage.CoreBlock;

const networkName = "azimut-network"; // поправь на точное имя блока
const powerPerSec = 2.5;              // сколько энергии/сек даёт ядро

const network = Vars.content.getByName(ContentType.block, networkName);

// 1) включаем power-флаги
network.hasPower = true;
network.outputsPower = true;
network.connectedPower = true;

// (опционально) пусть проводит энергию как “кабель” при касании
// network.conductivePower = true;  // если хочешь чтобы касанием проводил как провод 3

// 2) подменяем buildType
network.buildType = () => new JavaAdapter(CoreBlock.CoreBuild, {
  // движок будет спрашивать это значение как производство энергии
  getPowerProduction(){
    // можно завязать на предметы в ядре, прогресс, статус, сектор и т.п.
    return powerPerSec;
  },

});