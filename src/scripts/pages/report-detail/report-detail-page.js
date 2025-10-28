import {
  generateCommentsListEmptyTemplate,
  generateCommentsListErrorTemplate,
  generateLoaderAbsoluteTemplate,
  generateRemoveReportButtonTemplate,
  generateReportCommentItemTemplate,
  generateReportDetailErrorTemplate,
  generateReportDetailTemplate,
  generateSaveReportButtonTemplate,
} from '../../templates';
import { createCarousel } from '../../utils';
import ReportDetailPresenter from './report-detail-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import Map from '../../utils/map';
import * as CityCareAPI from '../../data/api';
import Database from '../../data/database';

export default class ReportDetailPage {
  #presenter = null;
  #form = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="report-detail__container">
          <div id="report-detail" class="report-detail"></div>
          <div id="report-detail-loading-container"></div>
        </div>
      </section>
      

    `;
  }

  async afterRender() {
    this.#presenter = new ReportDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: CityCareAPI,
      dbModel: Database,
    });

    // this.#setupForm();

    this.#presenter.showReportDetail();
    // this.#presenter.getCommentsList();
  }

  async populateReportDetailAndInitialMap(message, report) {
    if (!report) {
      console.error('populateReportDetailAndInitialMap: report is null or undefined');
      return;
    }

    document.getElementById('report-detail').innerHTML = generateReportDetailTemplate({
      title: report.name || 'Tanpa Judul',
      description: report.description || 'Tidak ada deskripsi',
      evidenceImages: report.photoUrl,
      lat: report.lat,
      lon: report.lon,
      location: {
        placeName: report.location.placeName,
        latitude: report.lat,
        longitude: report.lon,
      },
      reporterName: report.name,
      createdAt: report.createdAt,
    });

    // Carousel images
    createCarousel(document.getElementById('images'));

    // Map
    await this.#presenter.showReportDetailMap();

    if (this.#map) {
      // Pastikan lat/lon valid
      if (typeof report.lat === 'number' && typeof report.lon === 'number') {
        const reportCoordinate = [report.lat, report.lon];
        const markerOptions = { alt: report.name };
        const popupOptions = { content: report.name };

        this.#map.changeCamera(reportCoordinate);
        this.#map.addMarker(reportCoordinate, markerOptions, popupOptions);
      } else {
        console.warn(
          'populateReportDetailAndInitialMap: lat/lon tidak valid',
          report.lat,
          report.lon,
        );
      }
    }

    // Actions buttons
    this.#presenter.showSaveButton();
    this.addNotifyMeEventListener();
  }

  populateReportDetailError(message) {
    document.getElementById('report-detail').innerHTML = generateReportDetailErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
    });
  }

  renderSaveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateSaveReportButtonTemplate();

    document.getElementById('report-detail-save').addEventListener('click', async () => {
      await this.#presenter.saveReport();
      await this.#presenter.showSaveButton();
    });
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }
  saveToBookmarkFailed(message) {
    alert(message);
  }

  renderRemoveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateRemoveReportButtonTemplate();

    document.getElementById('report-detail-remove').addEventListener('click', async () => {
      await this.#presenter.removeReport();
      await this.#presenter.showSaveButton();
    });
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }
  removeFromBookmarkFailed(message) {
    alert(message);
  }

  addNotifyMeEventListener() {
    document.getElementById('report-detail-notify-me').addEventListener('click', () => {
      this.#presenter.notifyMe();
    });
  }

  showReportDetailLoading() {
    document.getElementById('report-detail-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideReportDetailLoading() {
    document.getElementById('report-detail-loading-container').innerHTML = '';
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  // populateReportDetailComments(message, comments) {
  //   if (comments.length <= 0) {
  //     this.populateCommentsListEmpty();
  //     return;
  //   }

  //   const html = comments.reduce(
  //     (accumulator, comment) =>
  //       accumulator.concat(
  //         generateReportCommentItemTemplate({
  //           photoUrlCommenter: comment.commenter.photoUrl,
  //           nameCommenter: comment.commenter.name,
  //           body: comment.body,
  //         }),
  //       ),
  //     '',
  //   );

  //   document.getElementById('report-detail-comments-list').innerHTML = `
  //     <div class="report-detail__comments-list">${html}</div>
  //   `;
  // }

  // populateCommentsListEmpty() {
  //   document.getElementById('report-detail-comments-list').innerHTML =
  //     generateCommentsListEmptyTemplate();
  // }

  // populateCommentsListError(message) {
  //   document.getElementById('report-detail-comments-list').innerHTML =
  //     generateCommentsListErrorTemplate(message);
  // }

  // #setupForm() {
  //   this.#form = document.getElementById('comments-list-form');
  //   this.#form.addEventListener('submit', async (event) => {
  //     event.preventDefault();

  //     const data = {
  //       body: this.#form.elements.namedItem('body').value,
  //     };
  //     await this.#presenter.postNewComment(data);
  //   });
  // }

  // postNewCommentSuccessfully(message) {
  //   console.log(message);

  //   this.#presenter.getCommentsList();
  //   this.clearForm();
  // }

  // postNewCommentFailed(message) {
  //   alert(message);
  // }

  // clearForm() {
  //   this.#form.reset();
  // }

  // showCommentsLoading() {
  //   document.getElementById('comments-list-loading-container').innerHTML =
  //     generateLoaderAbsoluteTemplate();
  // }

  // hideCommentsLoading() {
  //   document.getElementById('comments-list-loading-container').innerHTML = '';
  // }

  // showSubmitLoadingButton() {
  //   document.getElementById('submit-button-container').innerHTML = `
  //     <button class="btn" type="submit" disabled>
  //       <i class="fas fa-spinner loader-button"></i> Tanggapi
  //     </button>
  //   `;
  // }

  // hideSubmitLoadingButton() {
  //   document.getElementById('submit-button-container').innerHTML = `
  //     <button class="btn" type="submit">Tanggapi</button>
  //   `;
  // }
}
