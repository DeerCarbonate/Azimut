// Взят пример из asterion
// Пример: const "кодовое название предмета" = extend("Класс/type", "в кавычках название блока json", {});
// Ресурсная логистика
const cobaltduct = extend(Duct, "cobalt-duct", {});

const geliarinduct = extend(StackConveyor, "geliarin-duct", {});

const cobaltjunction = extend(Junction, "cobalt-junction", {});

const cobaltductbridge = extend(DuctBridge, "cobalt-duct-bridge", {});

const cobaltrouter = extend(Router, "cobalt-router", {});

const cobaltsorter = extend(Sorter, "cobalt-sorter", {});

const cobaltoverflowgate = extend(OverflowDuct, "cobalt-overflow-gate", {});

const invertedcobaltgateway = extend(OverflowDuct, "inverted-cobalt-overflow-gate", {});

// Стены
const veneriumwall = extend(Wall, "venerium-wall", {});

const veneriumlargewall = extend(Wall, "venerium-large-wall", {});

const veneriumhugewall = extend(Wall, "venerium-huge-wall", {});

const compoundwall = extend(Wall, "compound-wall", {});

const compoundlargewall = extend(Wall, "compound-large-wall", {});

const compoundhugewall = extend(Wall, "compound-huge-wall", {});

// Турели
const yongsin = extend(ItemTurret, "yongsin", {});

const priority = extend(PowerTurret, "priority", {});

const dezolo = extend(ItemTurret, "dezolo", {});

const relocator = extend(ItemTurret, "relocator", {});

const jannabi = extend(ItemTurret, "jannabi", {});

const retray = extend(ItemTurret, "retray", {});

const astraeus = extend(PowerTurret, "astraeus", {});