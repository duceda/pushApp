import { Component, OnInit, ApplicationRef } from '@angular/core';
import { PushService } from '../services/push.service';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  mensajes: OSNotificationPayload[] = [];

  // ApplicationRef - es para relanzar el ciclo de detección de angular
  constructor(
    public pushSrv: PushService,
    private applicationRef: ApplicationRef
  ) {}

  ngOnInit() {
    this.pushSrv.pushListener.subscribe((noti: OSNotificationPayload) => {
      this.mensajes.unshift(noti);
      // el método tick de application ref lanza el ciclo de detección de cambios manualmente
      this.applicationRef.tick();
    });
  }

  async ionViewWillEnter() {
    console.log('willEnter - cargar mensajes');
    this.mensajes = await this.pushSrv.getMensajes();
  }

  async borrarMensajes() {
    await this.pushSrv.borrarMensajes();
  }
}
