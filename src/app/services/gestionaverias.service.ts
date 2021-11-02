import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Averia } from '../models/gaveria';
import { AveriaDet } from '../models/gaveriaDet';
import * as firebase from 'firebase';
import * as moment from 'moment';
import { Pedido } from '../models/pedido';

@Injectable({
  providedIn: 'root'
})

export class GestionaveriasService {

  pdfUrl="";
  selectedIndex = 0;
  matrisDetAveria: AveriaDet[]=[];
  elementoBorrados: AveriaDet[]=[];
  docAdd:number = -1;
  readonlyField = false;
  disabledFieldVen = false;
  txtBtnAccion = "Crear Averia";
  pestana = "";
  enviar = false;
  mostrarForm: boolean = false;
  mostrarForm2: boolean = false;
  mostrarForm3: boolean = false;
  mostrardesc: boolean = false;
  valorAutAve: string;
  valorAutCli: string;
  valorAutVen: string;
  presAscList: string ="";
  indicadorImpuesto: number;
  indicadorImpuestoDesc: string;
  lpedidoList: Pedido[]; //arreglo vacio
  averiaslistDet=[];
  totalPri: number = 0;
  totalCnt: number = 0;
  totalAve: number = 0;
  nomCli='';
  rifCli='';
  nomrifCli='';
 

  orden: number;

  start_time = moment(new Date()).format('YYYY-MM-DD');

  averia_ = {} as Averia;
  averiaDet_ = {} as AveriaDet;

  itemsCollection: AngularFirestoreCollection<AveriaDet>;
  items: Observable<AveriaDet[]>;
  itemDoc: AngularFirestoreDocument<AveriaDet>;

  itemsCollection2: AngularFirestoreCollection<Averia>;
  items2: Observable<Averia[]>;
  itemDoc2: AngularFirestoreDocument<Averia>;

  averiasrep: Observable<Averia[]>;
  averiaDocrep: AngularFirestoreDocument<Averia>;
  averiasColletionrep: AngularFirestoreCollection<Averia>;

  averias: Observable<Averia[]>;
  averiaDoc: AngularFirestoreDocument<Averia>;
  averiasColletion: AngularFirestoreCollection<Averia>;

  averiasA: Observable<Averia[]>;
  averiaDocA: AngularFirestoreDocument<Averia>;
  averiasColletionA: AngularFirestoreCollection<Averia>;

  averiasF: Observable<Averia[]>;
  averiaDocF: AngularFirestoreDocument<Averia>;
  averiasColletionF: AngularFirestoreCollection<Averia>;

  averiasD: Observable<Averia[]>;
  averiaDocD: AngularFirestoreDocument<Averia>;
  averiasColletionD: AngularFirestoreCollection<Averia>;

  averiasE: Observable<Averia[]>;
  averiaDocE: AngularFirestoreDocument<Averia>;
  averiasColletionE: AngularFirestoreCollection<Averia>;

  averiasStat: Observable<Averia[]>;
  averiaDocStat: AngularFirestoreDocument<Averia>;
  averiasColletionStat: AngularFirestoreCollection<Averia>;

  averiasDet: Observable<AveriaDet[]>;
  averiaDetDoc: AngularFirestoreDocument<AveriaDet>;
  averiasDetColletion: AngularFirestoreCollection<AveriaDet>;
  db2 = firebase.firestore();

  constructor(public db: AngularFirestore) 
  { 
    //Busca todas las averias
    this.averiasColletion = this.db.collection('averias', ref => ref.where("status", 'in', ['ABIERTA', 'PROCESADA', 'DESPACHADO','ENTREGADO','ELIMINADO']).orderBy("creado", "desc").limit(10));
    this.averias = this.averiasColletion.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Averia; 
        return data;
      })
    }));

    //Busca todas las averias con estatus ABIERTA
    this.averiasColletionA = this.db.collection('averias', ref => ref.where("status", 'in', ['ABIERTA']).orderBy("creado", "desc").limit(50));
    this.averiasA = this.averiasColletionA.snapshotChanges().pipe(map(changes => {
     return changes.map(a => {
        const data = a.payload.doc.data() as Averia;
        return data;
      })
    }));

    //Busca todos los averias con estatus PROCESADA
    this.averiasColletionF = this.db.collection('averias', ref => ref.where("status", 'in', ['PROCESADA','CERRADA']).orderBy("creado", "desc").limit(50));
    this.averiasF = this.averiasColletionF.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Averia;
        return data;
      })
    }));

    //Busca todos los averias con estatus DESPACHADO
    this.averiasColletionD = this.db.collection('averias', ref => ref.where("status", 'in', ['DESPACHADO']).orderBy("creado", "desc").limit(50));
    this.averiasD = this.averiasColletionD.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Averia;
        return data;
      })
    }));

    //Busca todos los averias con estatus ENTREGADO
    this.averiasColletionE = this.db.collection('averias', ref => ref.where("status", 'in', ['ENTREGADO']).orderBy("creado", "desc").limit(50));
    this.averiasE = this.averiasColletionE.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Averia;
        return data;
      })
   }));

   this.averiasDetColletion = this.db.collection('averiasDet');

  }//constructor


  getAveriasRep01(strq){
    //this.averiasColletionrep = this.db.collection("averias", ref => ref.where("fechaaveria", ">=", desde).where("fechaaveria", "<=", hasta).where("idcliente", "==", codCliente).where("status", "==", status).where("nomvendedor", "==", vendedor).where("condiciondepago", "in", conPago).orderBy("fechaaveria", "desc").orderBy("creado", "desc").limit(5000));
  
    this.averiasColletionrep = this.db.collection("averias", strq);
    this.averiasrep = this.averiasColletionrep.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Averia;
        return data;
      })
    }));
    return this.averiasrep;
  }//getAveriasRep

  getAveriasRep02(strq){
    this.averiasColletionrep = this.db.collection('averias', strq);
    this.averiasrep = this.averiasColletionrep.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Averia;
        return data;
      })
    }));

    return this.averiasrep;
  }//getAveriasRep02

  getAveriasRep03(strq){
    this.averiasColletionrep = this.db.collection('averias', strq);
    this.averiasrep = this.averiasColletionrep.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Averia;
        return data;
      })
    }));

    return this.averiasrep;
  }//getAveriasRep03

  getAveriasRep04(strq){
    this.averiasColletionrep = this.db.collection('averias', strq);
    this.averiasrep = this.averiasColletionrep.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Averia;
        return data;
      })
    }));

    return this.averiasrep;
  }//getAveriasRep04

  getAverias(){
    return this.averias;
  }
  getAveriasA(){
    return this.averiasA;
  }
  getAveriasF(){
    return this.averiasF;
  }
  getAveriasD(){
    return this.averiasD;
  }
  getAveriasE(){
    return this.averiasE;
  }

  getOrderStat2(){
    return new Promise((resolve, reject) => {
      var docRef = this.db.collection("averias").doc("--stats--");
      docRef.get().toPromise()
        .then(doc => {
          const idAven = doc.data().idAve+1;
          //console.log(idAven);
          resolve(idAven);
        }).catch(function (err) {
          //console.log("Error getting document:", err);
          reject(err);
        });
    })
 }

  addAverias(ave: Averia,aveNro?:number){  

    //ID del documento geerado por firebase, es diferente al uid del averia correlativo
    ave.idaveria = aveNro;
    //ave.uid=aveNro; /*ID Correlativo para el averia */
    const db = firebase.firestore();
    const ref = db.collection('averias').doc(); /*Referencia de la coleccion*/
    const id = ref.id; /*ID Autogenerado*/
    this.docAdd = aveNro; /*Guardamos el Id Para los detalles del averia*/
    ave.uid=id;
    ref.set(ave) /* Guardamos el documento en la coleccion */
    .then(docRef =>{
      //console.log("Document written: ",this.docAdd);
    }).catch(function(error) {
      console.error("Error adding document: ", error);
    });

    var washingtonRef = db.collection('averias').doc('--stats--');
    // Atomically increment the population of the city by 50.
    washingtonRef.update({
        idAve: firebase.firestore.FieldValue.increment(1)
    });
  
  }

  deleteAverias(averia: Averia){
    this.averiaDoc = this.db.doc(`averias/${averia.uid}`);
    //this.averiaDoc.delete();
    this.averiaDoc.update(averia);
  }

  updateAverias(averia: Averia,anularN?:number){
    this.averiaDoc = this.db.doc(`averias/${averia.uid}`);
    this.averiaDoc.update(averia);

    if (anularN==9001){ 
      var cityRef = this.db.collection('averias').doc(averia.uid.toString());
      var removeCapital = cityRef.update({
          ffactura: firebase.firestore.FieldValue.delete(),
          tipodoc: firebase.firestore.FieldValue.delete(),
          nrofactura: firebase.firestore.FieldValue.delete()
      });
    }
    if (anularN==9002){ 
      var cityRef = this.db.collection('averias').doc(averia.uid.toString());
      var removeCapital = cityRef.update({
          ftentrega: firebase.firestore.FieldValue.delete(),
          fdespacho: firebase.firestore.FieldValue.delete(),
          transporte: firebase.firestore.FieldValue.delete()
      });
    }
  }

//detalles averia
getAveriasDet(uid){
      //Busca todos los detalles de averias
      this.itemsCollection = this.db.collection('averiasDet', ref => ref.where("idaveria", "==", uid).orderBy("indice", "asc"));
      this.averiasDet = this.itemsCollection.snapshotChanges().pipe(map(changes => {
        return changes.map(a => {
          const data = a.payload.doc.data() as AveriaDet;
          data.uid = a.payload.doc.id;
          return data;
        })
      }));
      return this.averiasDet;
}//getAveriasDet

addAveriasDet(ave: AveriaDet){
  this.averiasDetColletion.add(ave)
  .then(function(docRef) {
    console.log("Document written ");
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
  });
}

deleteAveriasDet(ave: AveriaDet){
  this.averiaDetDoc = this.db.doc(`averiasDet/${ave.uid}`);
  this.averiaDetDoc.delete();
}

updateAveriasDet(ave: AveriaDet){
  this.averiaDetDoc = this.db.doc(`averiasDet/${ave.uid}`);
  this.averiaDetDoc.update(ave);
}


}
