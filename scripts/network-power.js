// scripts/network-power.js
// Делает core-network источником энергии и разрешает подключение узлов.

const Vars = Packages.mindustry.Vars;
const Events = Packages.arc.Events;
const ContentType = Packages.mindustry.ctype.ContentType;
const CoreBlock = Packages.mindustry.world.blocks.storage.CoreBlock;
const ContentInitEvent = Packages.mindustry.game.EventType.ContentInitEvent;
const Log = Packages.arc.util.Log;

Events.on(ContentInitEvent, () => {
  // 1) Найдём блок по имени из файла core-network.hjson
  // Обычно это "core-network", но на всякий случай пробуем варианты.
  const candidates = ["core-network", "azimut-core-network"];
  let network = null;

  for (let i = 0; i < candidates.length; i++) {
    network = Vars.content.getByName(ContentType.block, candidates[i]);
    if (network != null) break;
  }

  if (network == null) {
    Log.err("[Azimut] core-network block not found. Tried: @", candidates);
    return;
  }

  // 2) Включаем power-модуль и подключение узлов
  network.hasPower = true;
  network.outputsPower = true;      // считается генератором
  network.connectedPower = true;    // к нему можно цеплять узлы

  // (Опционально) Сделать ядро ещё и “аккумулятором”
  // чтобы оно могло буферизовать энергию и поддерживать сеть при пиках.
  // Значение — сколько энергии может хранить.
  network.powerCapacity = Math.max(network.powerCapacity || 0, 2000);

  // 3) Добавляем производство энергии через кастомный билд
  // Внимание: power production = "энергии в секунду".
  const powerPerSec = 2.5; // настрой под баланс T1/T2

  // CoreBlock.CoreBuild — правильная база для CoreBlock
  network.buildType = () => new JavaAdapter(CoreBlock.CoreBuild, {
    getPowerProduction() {
      // Можно усложнить: зависимость от предметов в ядре, от прогресса, от количества узлов и т.п.
      return powerPerSec;
    },

    // (Опционально) Хоть какая-то “логика включения”
    // Например, выключать генерацию если ядро разрушено — но оно и так исчезает.
    // updateTile() {
    //   this.super$updateTile();
    // }
  });

  Log.info("[Azimut] core-network now outputs power (@/sec) and supports node connections.", powerPerSec);
});