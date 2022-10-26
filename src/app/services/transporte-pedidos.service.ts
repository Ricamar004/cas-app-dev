import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { TransportePedidos } from '../models/transporte-pedidos';
import { PedidoService } from './pedido.service';
import * as firebase from 'firebase';
import { resolve } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class TransportePedidosService {
  private dbPath = "transportePedidos";
  private countPath = "--stats--";
  mostrarForm: boolean = false;
  txtBtnAccion: string = "";

  transportePedidosRef: AngularFirestoreCollection<TransportePedidos>;
  tranportePedidosCountRef: AngularFirestoreCollection<any>;
  transportesActivosRef: AngularFirestoreCollection<TransportePedidos>;

  dataList: AngularFireList<TransportePedidos>;

  constructor(private db: AngularFirestore, private PedidoS: PedidoService) {
    this.transportePedidosRef = db.collection(this.dbPath);
    this.tranportePedidosCountRef = db.collection(this.countPath);
    this.transportesActivosRef = db.collection(this.dbPath, ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('estatus', '==', 'ACTIVO');
      return query;
    });

  }

  getAll() {
    return new Promise<any>((resolve) => {
      this.transportesActivosRef.valueChanges().subscribe(transportes => resolve(transportes))
    });
  }

  getOne(id){
    return new Promise<any>((resolve) => {
      this.transportesActivosRef.doc(`${id}`).valueChanges().subscribe(transporte => resolve(transporte))
    });
  }

  create(transportePedidos: TransportePedidos): any {

    const key = transportePedidos.id;
    this.transportePedidosRef.doc(`${transportePedidos.id}`).set({ ...transportePedidos });
    this.transportePedidosRef.doc(this.countPath).update({
      order: firebase.firestore.FieldValue.increment(1)
    });
    this.UpdatePedidos(transportePedidos.pedido, transportePedidos.id);
  }

  update(id: string, transportePedidos: TransportePedidos): Promise<void> {
    return this.transportePedidosRef.doc(`${id}`).update(transportePedidos);
  }

  delete(id: string, transportePedidos: TransportePedidos): Promise<void> {
    this.UpdatePedidos(transportePedidos.pedido, '');
    return this.transportePedidosRef.doc(`${id}`).delete();
  }
  getNextId() {
    return new Promise<any>((resolve) => {
      this.transportePedidosRef.doc(this.countPath).valueChanges().subscribe(count => resolve(count))
    });
  }

  UpdatePedidos(Pedidos, transporteId) {
    if (Pedidos.length > 0)
      Pedidos.map((pedido) => {
        pedido.transporteId = transporteId;
        this.PedidoS.updatePedidos(pedido);
      });
  }
}
