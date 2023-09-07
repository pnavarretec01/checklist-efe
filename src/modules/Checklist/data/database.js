import Dexie from "dexie";

const db = new Dexie("ChecklistDatabase");

db.version(1).stores({
  formularios:
    "++id, nombre_supervisor, fecha, subdivision, pk_inicio, pk_termino, observacion_general, cerrado",
  items: "++id, formulario_id, pk_item_id, nombre",
  subitems: "++id, item_id, pk_subitem_id, nombre",
  caracteristicas: "++id, subitem_id, pk, collera, observacion",
});

export default db;
