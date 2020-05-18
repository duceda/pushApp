import { Injectable, EventEmitter, ɵConsole } from '@angular/core';
import {
  OneSignal,
  OSNotification,
  OSNotificationPayload,
} from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class PushService {
  mensajes: OSNotificationPayload[] = [
    // {
    //   title: 'titulo del push',
    //   body: 'Este es el body',
    //   date: new Date(),
    // },
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal, private storage: Storage) {
    this.cargarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    // Esto se usa para mandar una referencia del objeto y no el objeto, que esto cambiaría
    // el valor donde se llame a esta función
    return [...this.mensajes];
  }

  configuracionInicial() {
    // 63c8b583-8cd2-4b86-ba69-9de3029b9d48 - El primer parámetro es la appID de OneSignal
    // 403857975464 - El segundo parámetro es el id de remitente de Firebase
    this.oneSignal.startInit(
      '63c8b583-8cd2-4b86-ba69-9de3029b9d48',
      '403857975464'
    );

    this.oneSignal.inFocusDisplaying(
      this.oneSignal.OSInFocusDisplayOption.Notification
    );

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
      // do something when notification is received
      console.log('notificacion recibida', noti);
      this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {
      // do something when a notification is opened
      console.log('notificacion abierta', noti);
      await this.notificacionRecibida(noti.notification);
    });

    // ObtenerID del subscriptor
    this.oneSignal.getIds().then((info) => {
      // tenemos también el token
      // info.pushToken
      this.userId = info.userId;
      console.log(this.userId);
    });

    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification) {
    await this.cargarMensajes();

    const payload = noti.payload;

    const existePush = this.mensajes.find(
      (notif: OSNotificationPayload) =>
        notif.notificationID === payload.notificationID
    );

    if (existePush) {
      return;
    }

    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    await this.guardarMensajes();
  }

  guardarMensajes() {
    this.storage.set('mensajes', this.mensajes);
  }

  async cargarMensajes() {
    this.mensajes = (await this.storage.get('mensajes')) || [];
    return this.mensajes;
  }

  async borrarMensajes() {
    await this.storage.remove('mensajes');
    this.mensajes = [];
    this.guardarMensajes();
  }
}
