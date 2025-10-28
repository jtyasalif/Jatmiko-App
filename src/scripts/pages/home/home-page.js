import {
  generateLoaderAbsoluteTemplate,
  generateReportItemTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from '../../templates';
import HomePresenter from './home-presenter';
import Map from '../../utils/map';
import * as CityCareAPI from '../../data/api';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="reports-list__map__container">
          <div id="map" class="reports-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Laporan Kerusakan</h1>

        <div class="reports-list__container">
          <div id="reports-list"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: CityCareAPI,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateReportsList(message, reports) {
    if (!Array.isArray(reports) || reports.length === 0) {
      this.populateReportsListEmpty();
      return;
    }

    const reportsListContainer = document.getElementById('reports-list');
    reportsListContainer.innerHTML = '';

    // Tambahkan marker untuk setiap laporan
    reports.forEach((report) => {
      const lat = parseFloat(report.lat);
      const lon = parseFloat(report.lon);

      if (this.#map && !isNaN(lat) && !isNaN(lon)) {
        const popupContent = `
        <strong>${report.name}</strong><br>
        ${report.description || 'Tidak ada deskripsi'}
      `;
        this.#map.addMarker([lat, lon], { alt: report.name }, { content: popupContent });
      }
    });

    // Buat tampilan daftar laporan
    const html = reports
      .map((report) =>
        generateReportItemTemplate({
          name: report.name,
          description: report.description,
          photoUrl: report.photoUrl,
          createdAt: new Date(report.createdAt).toLocaleString(),
          lat: report.lat,
          lon: report.lon,
          id: report.id,
        }),
      )
      .join('');

    reportsListContainer.innerHTML = `<div class="reports-list">${html}</div>`;
  }

  populateReportsListEmpty() {
    document.getElementById('reports-list').innerHTML = generateReportsListEmptyTemplate();
  }

  populateReportsListError(message) {
    document.getElementById('reports-list').innerHTML = generateReportsListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showLoading() {
    document.getElementById('reports-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = '';
  }
}
