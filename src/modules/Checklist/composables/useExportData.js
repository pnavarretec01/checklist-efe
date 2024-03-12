// useExportData.js
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function useExportData() {
  const getCurrentDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const exportToXLSX = (data, itemId) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Obtener el buffer
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Convertir el buffer a un blob
    const blob = new Blob([buffer], { type: "application/octet-stream" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const dateString = getCurrentDateString();
    link.download = `export_checklist_${itemId}_${dateString}.xlsx`;
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
      const dateString = getCurrentDateString();
      link.download = `export_checklist_${item.pk_formulario_id}_${dateString}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "xlsx") {
      exportToXLSX(dataToExport, item.pk_formulario_id);
    }
  };

  function transformDataForCSV(data) {
    const rows = [];

    data.items.forEach((item) => {
      item.subitems.forEach((subitem) => {
        subitem.data.forEach((d) => {
          if (d.pk || d.collera || d.observacion) {
            const row = {
              "PK Formulario ID": data.pk_formulario_id,
              "Nombre Supervisor": data.nombre_supervisor,
              Fecha: data.fecha,
              // "Subdivision ID": data.subdivision.pk_subdivision_id,
              "Subdivision Nombre": data.subdivision.nombre,
              "Observacion General": data.observacion_general,
              "PK Inicio": data.pk_inicio,
              "PK Termino": data.pk_termino,
              Cerrado: data.cerrado ? "Sí" : "No",
              Item: item.nombre,
              Subitem: subitem.nombre,
              PK: d.pk,
              Collera: d.collera,
              Observación: d.observacion,
            };
            rows.push(row);
          }
        });
      });
    });

    return rows;
  }

  function transformAllForms(formulario) {
    const formattedDate = new Date(formulario.fecha).toLocaleString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }); // formatea fecha a formato CL
    const rows = [];
    let generalDetailsAdded = false;

    formulario.items.forEach((item) => {
      item.subitems.forEach((subitem) => {
        let detailsAdded = false;

        subitem.data.forEach((data) => {
          if (data.pk || data.collera || data.observacion) {
            rows.push({
              "PK Formulario ID": formulario.pk_formulario_id,
              "Nombre Supervisor": formulario.nombre_supervisor,
              Fecha: formattedDate,
              "Subdivision Nombre": formulario.subdivision.nombre,
              "Observacion General": formulario.observacion_general,
              "PK Inicio": formulario.pk_inicio,
              "PK Termino": formulario.pk_termino,
              Cerrado: formulario.cerrado ? "Sí" : "No",
              Item: item.nombre,
              Subitem: subitem.nombre,
              PK: data.pk,
              Collera: data.collera,
              Observación: data.observacion,
            });
            detailsAdded = true;
            generalDetailsAdded = true;
          }
        });

        if (!detailsAdded) {
          // sin detalles, por ahor no hace nada
        }
      });
    });

    if (!generalDetailsAdded) {
      rows.push({
        "PK Formulario ID": formulario.pk_formulario_id,
        "Nombre Supervisor": formulario.nombre_supervisor,
        Fecha: formattedDate,
        "Subdivision Nombre": formulario.subdivision.nombre,
        "Observacion General": formulario.observacion_general,
        "PK Inicio": formulario.pk_inicio,
        "PK Termino": formulario.pk_termino,
        Cerrado: formulario.cerrado ? "Sí" : "No",
        Item: "",
        Subitem: "",
        PK: "",
        Collera: "",
        Observación: "",
      });
    }
    return rows;
  }

  const exportAllData = (allItems, format) => {
    const dataToExport = allItems.map((item) => transformAllForms(item)).flat();

    if (format === "csv") {
      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Checklists_todos_.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "xlsx") {
      exportToXLSX(dataToExport, `Checklists_todos`);
    }
  };

  return {
    exportData,
    exportAllData,
  };
}
