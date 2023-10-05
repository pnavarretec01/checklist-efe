// useExportData.js
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function useExportData() {
  const exportToXLSX = (data, itemId) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Obtener el buffer
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Convertir el buffer a un blob
    const blob = new Blob([buffer], { type: "application/octet-stream" });

    // Crear el elemento link para descargar el archivo
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `exported_data_${itemId}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportData = (item, format) => {
    const dataToExport = transformDataForCSV(item);

    if (format === "csv") {
      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `exported_data_${item.pk_formulario_id}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "xlsx") {
      exportToXLSX(dataToExport, item.pk_formulario_id);
    }
  };

  function transformDataForCSV(data) {
    const rows = [];
    let lastItemName = "";
    let lastSubitemName = "";

    data.items.forEach((item) => {
      item.subitems.forEach((subitem) => {
        if (subitem.data && subitem.data.length > 0) {
          subitem.data.forEach((d) => {
            rows.push({
              "PK Formulario ID":
                rows.length === 0 ? data.pk_formulario_id : "",
              "Nombre Supervisor":
                rows.length === 0 ? data.nombre_supervisor : "",
              Fecha: rows.length === 0 ? data.fecha : "",
              "Subdivision ID":
                rows.length === 0 ? data.subdivision.pk_subdivision_id : "",
              "Subdivision Nombre":
                rows.length === 0 ? data.subdivision.nombre : "",
              "Observacion General":
                rows.length === 0 ? data.observacion_general : "",
              "PK Inicio": rows.length === 0 ? data.pk_inicio : "",
              "PK Termino": rows.length === 0 ? data.pk_termino : "",
              Cerrado: rows.length === 0 ? (data.cerrado ? "Sí" : "No") : "",
              Item: item.nombre !== lastItemName ? item.nombre : "",
              Subitem: subitem.nombre !== lastSubitemName ? subitem.nombre : "",
              PK: d.pk,
              Collera: d.collera,
              Observación: d.observacion,
            });
            lastItemName = item.nombre;
            lastSubitemName = subitem.nombre;
          });
        } else {
          rows.push({
            "PK Formulario ID": rows.length === 0 ? data.pk_formulario_id : "",
            "Nombre Supervisor":
              rows.length === 0 ? data.nombre_supervisor : "",
            Fecha: rows.length === 0 ? data.fecha : "",
            "Subdivision ID":
              rows.length === 0 ? data.subdivision.pk_subdivision_id : "",
            "Subdivision Nombre":
              rows.length === 0 ? data.subdivision.nombre : "",
            "Observacion General":
              rows.length === 0 ? data.observacion_general : "",
            "PK Inicio": rows.length === 0 ? data.pk_inicio : "",
            "PK Termino": rows.length === 0 ? data.pk_termino : "",
            Cerrado: rows.length === 0 ? (data.cerrado ? "Sí" : "No") : "",
            Item: item.nombre !== lastItemName ? item.nombre : "",
            Subitem: subitem.nombre !== lastSubitemName ? subitem.nombre : "",
            PK: "",
            Collera: "",
            Observación: "",
          });
          lastItemName = item.nombre;
          lastSubitemName = subitem.nombre;
        }
      });
    });

    if (rows.length === 0) {
      rows.push({
        "PK Formulario ID": data.pk_formulario_id,
        "Nombre Supervisor": data.nombre_supervisor,
        Fecha: data.fecha,
        "Subdivision ID": data.subdivision.pk_subdivision_id,
        "Subdivision Nombre": data.subdivision.nombre,
        "Observacion General": data.observacion_general,
        "PK Inicio": data.pk_inicio,
        "PK Termino": data.pk_termino,
        Cerrado: data.cerrado ? "Sí" : "No",
        Item: "",
        Subitem: "",
        PK: "",
        Collera: "",
        Observación: "",
      });
    }

    return rows;
  }

  return {
    exportData,
  };
}
