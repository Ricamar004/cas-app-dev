import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { Pedido } from 'src/app/models/pedido';
import { PedidoDet } from 'src/app/models/pedidoDet';
import { PedidoService } from 'src/app/services/pedido.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { animate, state,style,transition,trigger } from '@angular/animations';

//  Service
import { ClientService } from '../../../services/client.service';
import { VendedorService } from '../../../services/vendedor.service';
import { LprecioService } from '../../../services/lprecio.service';
import { CpagoService } from '../../../services/cpago.service';
import { TransporteService } from '../../../services/transporte.service';
import { ProductService } from '../../../services/product.service';
import { UmedidaService } from '../../../services/umedida.service';
import { IimpuestoService } from '../../../services/iimpuesto.service';
import { FirebaseloginService } from 'src/app/services/firebaselogin.service';
import { TipodService } from 'src/app/services/tipod.service';
// Class
import { Client } from '../../../models/client';
import { Vendedor } from '../../../models/vendedor';
import { Lprecio } from '../../../models/lprecio';
import { Cpago } from '../../../models/cpago';
import { Transporte } from '../../../models/transporte';
import { Product } from '../../../models/product';
import { Umedida } from '../../../models/umedida';
import { Iimpuesto } from '../../../models/iimpuesto';
import { Tipod } from '../../../models/tipod';
import { registerLocaleData } from '@angular/common';
import { reduce } from 'rxjs/operators';
import { noUndefined } from '@angular/compiler/src/util';
import * as $ from 'jquery';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog,MatDialogConfig } from "@angular/material/dialog";
import { PedidoShowComponent } from '../pedido-show/pedido-show.component';

// Import pdfmake and the fonts to use
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"; // fonts provided for pdfmake
import { finalize } from 'rxjs/operators';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { DatoempService } from 'src/app/services/datoemp.service';
import { Datoemp } from 'src/app/models/datoemp';
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-pedido-nd',
  templateUrl: './pedido-nd.component.html',
  styleUrls: ['./pedido-nd.component.css']
})
export class PedidoNdComponent implements OnInit {
  //PARA EL LISTADO DE PEDIDOS
  dataSource: any;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  displayedColumns: string[] = ['idpedido', 'fechapedido', 'status', 'listaprecio', 'condiciondepago', 'nomcliente', 'nomvendedor', 'totalmontobruto','totalmontodescuento','totalmontoneto', 'Opc'];

  pedidoVer_ = {} as Pedido;
  //PARA EL LISTADO DE PEDIDOS



  ocultarBtn: string;
  MostrarPed: string;
  mensaje01: string;
  opcnf = false;
  opcnd = false;
  opcne = false;
  estadoElement= "estado1";
  currencyPipeVEF='VEF';
  currencyPipeUSD='USD';
  currencyPipe: String;
  elementoBorrados: PedidoDet[]=[];

  valorAutPed = "";
  pedidoslistDet=[];
  pedido_ = {} as Pedido;
  pedidoDet_ = {} as PedidoDet;

  totalPri: number = 0;
  totalCnt: number = 0;
  totalPed: number = 0;

  tmontb: number=0;
  tmontd: number=0;
  tmonti: number=0;
  tmontn: number=0;


  nomCli='';
  rifCli='';
  tlfCli='';
  dirCli='';
  zonVen='';
  public URLPublica: any;
  public dempresaList: Datoemp[]; //arreglo vacio

  public pedidoslist: Pedido[];
  public clienteList: Client[]; //arreglo vacio
  public vendedorList: Vendedor[]; //arreglo vacio
  public lprecioList: Lprecio[]; //arreglo vacio
  public cpagoList: Cpago[]; //arreglo vacio
  public transporteList: Transporte[]; //arreglo vacio
  public productList: Product[]; //arreglo vacio
  public umedidaList: Umedida[]; //arreglo vacio
  public iimpuestoList: Iimpuesto[]; //arreglo vacio
  public tipodocList: Tipod[]; //arreglo vacio


  public keywordPed = "uid";
  public keywordsCli = ['idcliente','descripcion'];

  maxDate= moment(new Date()).format('YYYY-MM-DD');
  minDate = moment(new Date()).format('YYYY-MM-DD');

  enviar = false;
  private myempty: number;
  public msj_enlace: string = 'Pedidos';

  someticket = false; //Variable que almacena si tiene etiquetas

  @ViewChild('pedidoFormnf') myFormnf;
  @ViewChild('pedidoFormnd') myFormnd;
  @ViewChild('pedidoFormne') myFormne;


  constructor
  (
    public pedidoService: PedidoService,
    private toastr      : ToastrService,
    public clienteS     : ClientService,
    public vendedorS    : VendedorService,
    public lprecioS     : LprecioService,
    public cpagoS       : CpagoService,
    public transporteS  : TransporteService,
    public productS     : ProductService,
    public umedidaS     : UmedidaService,
    public iimpuestoS   : IimpuestoService,
    public loginS       : FirebaseloginService,
    public tipodS       : TipodService,
    private dialogo     : MatDialog,
    private afStorage:AngularFireStorage,
    public datoempresaS : DatoempService
  )
  {
    const currentYear = new Date().getFullYear();
    const currentm = new Date().getMonth();
    const currentd = new Date().getDate();
    //this.maxDate = new Date(currentYear, currentm, currentd);
  }


  ngOnInit(): void {
    this.ocultarBtn = 'padding: 10px;display:none;';
    this.MostrarPed = 'display:none;';

    this.pedidoService.getPedidosPreparados().subscribe(pedidos=>{
      this.pedidoslist = pedidos;
      //ELEMENT_DATA
      this.dataSource = new MatTableDataSource(this.pedidoslist);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

    })

    this.pedido_ = {} as Pedido;
    this.valorAutPed = "";

    this.clienteS.getClients().valueChanges().subscribe(cs =>{
      this.clienteList = cs;
    })

    this.vendedorS.getVendedors().valueChanges().subscribe(vs =>{
      this.vendedorList = vs;
    })

    this.lprecioS.getLprecio().valueChanges().subscribe(lps =>{
      this.lprecioList = lps;
    })

    this.cpagoS.getCpagos().valueChanges().subscribe(cps =>{
      this.cpagoList = cps;
    })

    this.transporteS.getTransportes().valueChanges().subscribe(tra =>{
      this.transporteList = tra;
    })

    this.productS.getProducts().valueChanges().subscribe(ps =>{
      this.productList = ps;
    })

    this.umedidaS.getUmedidas().valueChanges().subscribe(ums =>{
      this.umedidaList = ums;
    })

    this.iimpuestoS.getIimpuestos().valueChanges().subscribe(iis =>{
      this.iimpuestoList = iis;
    })

    this.tipodS.getTipods().valueChanges().subscribe(tid =>{
      this.tipodocList = tid;
    })
    this.datoempresaS.getDatoemps().valueChanges().subscribe(emps =>{
      this.dempresaList = emps;
    })

    this.enviar = false;
    //coloca el campo de busqueda de vendedror disabled
    this.pedidoService.disabledFieldVen = true;

  }//ngOnInit


/**
 * PARA EL LISTADO DE PEDIDOS
*/
applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = filterValue.trim().toLowerCase();
}


timestampConvert(fec,col?:number){
  let dateObject = new Date(fec.seconds*1000);
  let mes_ = dateObject.getMonth()+1;
  let ano_ = dateObject.getFullYear();
  let dia_ = dateObject.getDate();
  if (col==1){
    this.pedidoVer_.fechapedido = dateObject;
  }
  if (col==2){
    this.pedidoVer_.ffactura = dateObject;
  }
  if (col==3){
    this.pedidoVer_.fdespacho = dateObject;
  }
  if (col==4){
    this.pedidoVer_.fpago = dateObject;
  }
  if (col==5){
    this.pedidoVer_.ftentrega = dateObject;
  }
  if (col==6){
    this.pedidoVer_.fentrega = dateObject;
  }
  if (col==7){
    this.pedidoVer_.fpreparacion = dateObject;
  }
}

verdetalles(event, ped){

  ped.fdespacho = undefined;
  ped.ftentrega = undefined;
  const dialogConfig = new MatDialogConfig;
  //dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.maxWidth = "100%"
  dialogConfig.width = "95%"
  dialogConfig.height = "95%"

  this.pedidoVer_ =  Object.assign({}, ped);
  this.timestampConvert(ped.fechapedido,1);

  if (ped.ffactura !== null && typeof ped.ffactura != "undefined"){
    this.timestampConvert(ped.ffactura,2);
  }
  if (ped.fdespacho !== null && typeof ped.fdespacho != "undefined"){
    this.timestampConvert(ped.fdespacho,3);
  }
  if (ped.fpago !== null && typeof ped.fpago != "undefined"){
    this.timestampConvert(ped.fpago,4);
  }
  if (ped.ftentrega !== null && typeof ped.ftentrega != "undefined"){
    this.timestampConvert(ped.ftentrega,5);
  }
  if (ped.fentrega !== null && typeof ped.fentrega != "undefined"){
    this.timestampConvert(ped.fentrega,6);
  }
  if (ped.fpreparacion !== null && typeof ped.fpreparacion != "undefined"){
    this.timestampConvert(ped.fpreparacion,7);
  }

  dialogConfig.data = {
    pedidoShow: Object.assign({}, this.pedidoVer_)
  };

  this.dialogo.open(PedidoShowComponent,dialogConfig);
}


onCancelar(pf?: NgForm,de?:number){
  if (de == 0){
    if (this.pedido_.fdespacho !== undefined || this.pedido_.transporte !== undefined || this.pedido_.ftentrega !== undefined){
      if(confirm("¿Quieres abandonar el pedido? " )) {
        if(pf != null) pf.reset();
        this.pedidoslistDet=[];
        this.totalPri = 0;
        this.totalCnt = 0;
        this.totalPed = 0;

        this.tmontb=0;
        this.tmontd=0;
        this.tmonti=0;
        this.tmontn=0;
        this.pedido_ = {} as Pedido;
      }
    }
    else
    {
        if(pf != null) pf.reset();
        this.pedidoslistDet=[];
        this.totalPri = 0;
        this.totalCnt = 0;
        this.totalPed = 0;

        this.tmontb=0;
        this.tmontd=0;
        this.tmonti=0;
        this.tmontn=0;
        this.pedido_ = {} as Pedido;
    }
  }else{
    if(pf != null) pf.reset();
    this.pedidoslistDet=[];
    this.totalPri = 0;
    this.totalCnt = 0;
    this.totalPed = 0;

    this.tmontb=0;
    this.tmontd=0;
    this.tmonti=0;
    this.tmontn=0;
    this.pedido_ = {} as Pedido;
  }
}

/**
 * PARA EL LISTADO DE PEDIDOS +
*/


generarpdf(pf?: NgForm)
{

  var bodyData = [];
  let observacion='';
  let totalArticulos=0;
  let spaceBottom=260;

  bodyData = this.pedidoService.matrisDetPedido;

  if (this.pedido_.observacion=="" || typeof this.pedido_.observacion=="undefined"){
    observacion = "";
  }else{
    observacion = "Observación: "+this.pedido_.observacion;
  }


  var rows = [];
  rows.push(['', '', '', '', '']);
  //console.log('cccccc: ',this.pedidoslistDet);
  for (let i in this.pedidoslistDet){
    let indice:number = parseInt(i);
    rows.push([this.pedidoslistDet[i].codigodematerial.toString(), this.pedidoslistDet[i].descripcionmaterial.toString(),this.pedidoslistDet[i].cantidadmaterial.toLocaleString('de-DE', {maximumFractionDigits: 0}), this.pedidoslistDet[i].preciomaterial.toLocaleString('de-DE', {maximumFractionDigits: 2,minimumFractionDigits:2}), this.pedidoslistDet[i].totalpormaterial.toLocaleString('de-DE', {maximumFractionDigits: 2,minimumFractionDigits:2})]);
    totalArticulos = indice+1;
    if (totalArticulos>1){
      spaceBottom=spaceBottom-20;
    }
  }

  //rows.push(['', '',this.pedidoService.totalCnt,'', this.pedidoService.totalPed.toFixed(2)]);

//let docAdd = 'PED' + (Math.floor(100000 + Math.random() * 900000)).toString() + Date.now().toString();
  let docAdd = this.pedido_.idpedido;

  //const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthNames = ["01", "02", "03", "04", "05", "06","07", "08", "09", "10", "11", "12"];

  let dateObj = this.pedido_.fechapedido;
  let min_ = dateObj.getMinutes();

  var horas_ = new Array();
  horas_ [0]  = "12:" + min_ + " PM";
  horas_ [23] = "11:" + min_ + " PM";
  horas_ [22] = "10:" + min_ + " PM";
  horas_ [21] = "09:" + min_ + " PM";
  horas_ [20] = "08:" + min_ + " PM";
  horas_ [19] = "07:" + min_ + " PM";
  horas_ [18] = "06:" + min_ + " PM";
  horas_ [17] = "05:" + min_ + " PM";
  horas_ [16] = "04:" + min_ + " PM";
  horas_ [15] = "03:" + min_ + " PM";
  horas_ [14] = "02:" + min_ + " PM";
  horas_ [13] = "01:" + min_ + " PM";
  horas_ [12] = "12:" + min_ + " AM";
  horas_ [11] = "11:" + min_ + " AM";
  horas_ [10] = "10:" + min_ + " AM";
  horas_ [9] = "09:" + min_ + " AM";
  horas_ [8] = "08:" + min_ + " AM";
  horas_ [7] = "07:" + min_ + " AM";
  horas_ [6] = "06:" + min_ + " AM";
  horas_ [5] = "05:" + min_ + " AM";
  horas_ [4] = "04:" + min_ + " AM";
  horas_ [3] = "03:" + min_ + " AM";
  horas_ [2] = "02:" + min_ + " AM";
  horas_ [1] = "01:" + min_ + " AM";

  let month = monthNames[dateObj.getMonth()];
  let day = String(dateObj.getDate()).padStart(2, '0');
  let year = dateObj.getFullYear();
  let momento = horas_[dateObj.getHours()];
  let output = day +'/'+ month + '/' + year + ' '+ momento;

  const documentDefinition = {
    pageSize: {
      width: 600,
      height: 760
    },
    pageMargins: [ 25, 30, 25, 120 ],

    footer: {

          columns:
          [
            { //columna 0
              width: 25,
              text:''
            },
            { //columna 1
              width: 295,
              table:
              {
                  dontBreakRows: true,
                  widths: [80, 145],
                  body: [
                    [
                        {text: 'Total artículos:',style: "boldtxt", border: [true, true, false, false]},
                        {text: totalArticulos, border: [false, true, true, false]}
                    ],
                    [
                        {text: 'Total cantidades:',style: "boldtxt", border: [true, false, false, true]},
                        {text: this.pedido_.totalCnt.toLocaleString('de-DE', {maximumFractionDigits: 0}), border: [false, false, true, true]}
                    ]
                  ]
              }
            }, //columna 2
            {
                width: 180,
                table:
                {
                    dontBreakRows: true,
                    widths: [70, 155],
                    body: [
                      [
                          {text: 'Sub total:',style: "boldtxt", border: [true, true, false, false]},
                          {text: this.pedido_.totalmontobruto.toLocaleString('de-DE', {maximumFractionDigits: 2,minimumFractionDigits:2}), alignment: 'left' , border: [false, true, true, false]}
                      ],
                      [
                          {text: 'Descuento:',style: "boldtxt", border: [true, false, false, false]},
                          {text: this.pedido_.totalmontodescuento.toLocaleString('de-DE', {maximumFractionDigits: 2,minimumFractionDigits:2}), alignment: 'left', border: [false, false, true, false]}
                      ],
                      [
                          {text: 'Total a pagar:',style: "boldtxt", border: [true, false, false, true]},
                          {text: this.pedido_.totalmontoneto.toLocaleString('de-DE', {maximumFractionDigits: 2,minimumFractionDigits:2}), alignment: 'left', border: [false, false, true, true]}
                      ]
                    ]
                }
            }
          ],

    },

    content: [
      // if you don't need styles, you can use a simple string to define a paragraph

      {
        columns: [
          {
            width: 150,
            image: this.dempresaList[0].imglogob64,
            height: 37
          },
          {
            width: 10,
            text: ''
          },
          {
            width: 200,
            table:
            {
                widths: [200],
                body:
                    [
                        [
                            {text: this.dempresaList[0].descripcion,style: "boldtxt", alignment: 'center', fontSize: 12,border: [false, false, false, false]},
                        ],
                        [
                            {text: this.dempresaList[0].direccion, fontSize: 10,border: [false, false, false, false]},
                        ]
                    ]
            }
          },
          {
            width: 5,
            text: ''
          },
          {
            width: '*',
            table:
            {
                widths: [40,'*'],
                body:
                    [
                        [
                            {text: 'Teléfono',style: "boldtxt", fontSize: 10,border: [false, false, false, false]},
                            {text: this.dempresaList[0].telefonoFijo, fontSize: 10,border: [false, false, false, false]},
                        ],
                        [
                            {text: 'Celular',style: "boldtxt", fontSize: 10,border: [false, false, false, false]},
                            {text: this.dempresaList[0].telefonocel1, fontSize: 10,border: [false, false, false, false]},
                        ],
                        [
                            {text: 'Email:',style: "boldtxt", fontSize: 10,border: [false, false, false, false]},
                            {text: this.dempresaList[0].email, fontSize: 9,border: [false, false, false, false]},
                        ]
                    ]
            }


          }
        ],
      },

      { text:'Confirmación de pedido ',style: "linecentertitle",fontSize: 16},

      { //dos columnas, en cada se define una tabla
        columns:
        [
          {
            width: 285,
            table:
            {
                widths: [50, 175],
                body: [
                  [
                      {text: 'Cliente:',style: "boldtxt", border: [true, true, false, false]},
                      {text: this.pedido_.nomcliente, border: [false, true, true, false]}
                  ],
                  [
                    {text: 'Rif:',style: "boldtxt", border: [true, false, false, false]},
                    {text: this.pedido_.idcliente, border: [false, false, true, false]}
                  ],
                  [
                      {text: 'Teléfono:',style: "boldtxt", border: [true, false, false, false]},
                      {text: this.tlfCli, border: [false, false, true, false]}
                  ],
                  [
                      {text: 'Dirección:',style: "boldtxt", border: [true, false, false, true]},
                      {text: this.dirCli, border: [false, false, true, true]}
                  ]
                ]
            }
          },
          {
              width: 180,
              table:
              {
                  widths: [90, 135],
                  body: [
                    [
                        {text: 'N°:',style: "boldtxt", border: [true, true, false, false]},
                        {text: docAdd , border: [false, true, true, false]}
                    ],
                    [
                        {text: 'Fecha:',style: "boldtxt", border: [true, false, false, false]},
                        {text: output, border: [false, false, true, false]}
                    ],
                    [
                      {text: 'Condición de pago :',style: "boldtxt", border: [true, false, false, true]},
                      {text: this.pedido_.condiciondepago, border: [false, false, true, true]}
                    ]
                    ,
                    [
                        {text: '', border: [false, false, false, false]},
                        {text: '', border: [false, false, false, false]}
                    ]
                    ,
                    [
                        {text: 'Vendedor:',style: "boldtxt", border: [true, true, false, false]},
                        {text: this.pedido_.nomvendedor, border: [false, true, true, false]}
                    ]
                    ,
                    [
                        {text: 'Zona:',style: "boldtxt", border: [true, false, false, true]},
                        {text: this.zonVen, border: [false, false, true, true]}
                    ]
                  ]
                }
          }
        ],
        // optional space between columns
        columnGap: 10
      },

       //solo espaciado
      { text:' ',style: "SpacingFull",fontSize: 16},

      //imprime el detalle de la matrix
      {
        width: 530,
        table:
        {
          widths: [530],
          body:
          [
            [
              {
                layout: 'lightHorizontalLines', // optional
                table:
                    {
                    widths: [55, 200, 60, 60, 60],
                    body:
                    [
                      [
                          {text: 'ARTÍCULO',style: "boldtxt", border: [true, true, false, true]},
                          {text: 'DESCRIPCIÓN',style: "boldtxt", border: [false, true, false, true]},
                          {text: 'CTD',style: "boldtxt", border: [false, true, false, true]},
                          {text: 'PRECIO U',style: "boldtxt", border: [false, true, false, true]},
                          {text: 'TOTAL',style: "boldtxt", border: [false, true, true, true]},
                      ]
                    ]

                    }
              }
            ]
          ]
        }
      },

      //TABLA SIMPLE SI RECUADRO EXTERNO. Se llena con la variable row
      {
        layout: 'headerLineOnly', // optional
        table: {
          widths: [60, 200, 60, 60, 60],
          body: rows
        }
      },

       //solo espaciado
      { text:' ',style: "SpacingFull2",fontSize: 16},
      { text: observacion,style: "lineSpacing",fontSize: 10,dontBreakRows: true},
      { text:' ',style: "lineSpacing",fontSize: 16},

    ],
    defaultStyle: {
      fontSize: 10
    },
    styles:{
      'linecentertitle': {
          margin:[190,30,0,30] //change number 6 to increase nspace
      },
      'lineSpacing': {
        margin:[0,0,0,10] //change number 6 to increase nspace
      },
      'SpacingFull': {
        margin:[0,0,0,30] //change number 6 to increase nspace
      },
      'SpacingFull2': {
        margin:[0,0,0,60] //change number 6 to increase nspace
      },
      'SpacingFullxl': {
        margin:[0,0,0,spaceBottom] //change number 6 to increase nspace
      },
      'boldtxt':{
        bold: true
      }
    }
  }; //documentDefinition

  //si se va a generar en string base64
  const pdfDocGenerator0 = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator0.getBase64((data) => {
      var file = data;
    // });


  //descomentar si se va agenerar el file de tipo blob. y comentar el de arriba
  //const pdfDocGenerator1 = pdfMake.createPdf(documentDefinition);
  // pdfDocGenerator1.getBlob((blob) => {
  //   var file = blob;

    //const id = 'Order-'+ Math.random().toString(36).substring(2)+Date.now()+'.pdf';
    const idfile = docAdd +'.pdf';
    this.pedido_.pdfname = idfile;
    this.pedido_.pdfb64 = file;
    const fileRef:AngularFireStorageReference=this.afStorage.ref("Orders").child(idfile);
    //const task: AngularFireUploadTask = fileRef.put(file); //Para guardar desde un archivo .Blob
    const task: AngularFireUploadTask = fileRef.putString(file, 'base64') //Para guardar desde un string base64
    task.snapshotChanges().pipe(
        finalize(() => {
          this.URLPublica = this.afStorage.ref("Orders").child(idfile).getDownloadURL();
            fileRef.getDownloadURL().subscribe(downloadURL => {
              this.pedido_.pdfurl=downloadURL;
              this.URLPublica = downloadURL;
              //this.onSubmit(pf,this.URLPublica,docAdd);
              this.onSubmitnd(pf); // Notificar Despacho
            });
      })
    ).subscribe();

  });//pdfDocGenerator


  //pdfMake.createPdf(documentDefinition).open();


}//pdf make

downloadEtiquetas() {
  window.open(this.pedido_.ticketurl);
}









  onSubmitnf(pf?: NgForm){
    if(this.pedido_.uid != null){
      this.pedido_.status="PREPARADO";
      this.pedido_.modificado = new Date;
      this.pedido_.modificadopor = this.loginS.getCurrentUser().email;

      //Update Pedido - Notifi Facttura
      this.pedidoService.updatePedidos(this.pedido_);
      this.toastr.success('Operación Terminada', 'Nofificacinón de despacho Creada');
    }
    this.onCancelar(pf,1);
  }
  onSubmitnd(pf?: NgForm){
    if(this.pedido_.uid != null){
      this.pedido_.status="DESPACHADO";
      this.pedido_.modificado = new Date;

      let ahora = new Date();
      this.pedido_.fdespacho = new Date(this.pedido_.fdespacho);
      this.pedido_.fdespacho.setDate(this.pedido_.fdespacho.getDate()+1);
      this.pedido_.fdespacho.setHours(ahora.getHours());
      this.pedido_.fdespacho.setMinutes(ahora.getMinutes());

      this.pedido_.ftentrega = new Date(this.pedido_.ftentrega);
      this.pedido_.ftentrega.setDate(this.pedido_.ftentrega.getDate()+1);
      this.pedido_.ftentrega.setHours(ahora.getHours());
      this.pedido_.ftentrega.setMinutes(ahora.getMinutes());

      //console.log("fdes: ",this.pedido_.fdespacho)
      //console.log("ftentre: ",this.pedido_.ftentrega)


      this.pedido_.lastaction = "Crear ND";
      this.pedido_.modificadopor = this.loginS.getCurrentUser().email;
      //Update Pedido - Notifi Facttura
      this.pedidoService.updatePedidos(this.pedido_);
      this.toastr.success('Operación Terminada', 'Nofificación de despacho creada.');
    }
    this.onCancelar(pf,1);
  }
  onSubmitne(pf?: NgForm){
    if(this.pedido_.uid != null){
      this.pedido_.status="ENTREGADO";
      this.pedido_.modificado = new Date;
      this.pedido_.modificadopor = this.loginS.getCurrentUser().email;
      //Update Pedido - Notifi Facttura
      this.pedidoService.updatePedidos(this.pedido_);
      this.toastr.success('Operación Terminada', 'Nofificacinón de entrega creada');
    }

  }
  anulardoc(pf?: NgForm,elemento?,num?:number){
    this.pedido_= elemento;
    if(confirm('¿Está seguro de que quiere anular la preparación en almacén para el pedido Nro: '+elemento.idpedido+'?')) {
      if(this.pedido_.uid != null){
          this.pedido_.status="FACTURADO";
          this.pedido_.modificado = new Date;
          this.pedido_.modificadopor = this.loginS.getCurrentUser().email;
          this.pedido_.lastaction = "Anular Prep";

          //Get Order detaills
    this.pedidoService.getPedidosDet(elemento.uid).subscribe(pedidosDet=>{
      this.pedidoslistDet = pedidosDet;

      for (let i in this.pedidoslistDet){
        this.totalPri = this.totalPri +  this.pedidoslistDet[i].preciomaterial;
        this.totalCnt = this.totalCnt +  this.pedidoslistDet[i].cantidadmaterial;
        this.totalPed = this.totalPed +  this.pedidoslistDet[i].totalpormaterial;

        //this.tmontb = this.tmontb + this.pedidoslistDet[i].totalpormaterial;
      }
    })
          

          //this.pedido_.ffactura = null;
          this.pedido_.nombrealmacenista = "";
          this.pedido_.nrobultos = null;
          this.pedido_.fpreparacion = null;
          //updatePedidosDet(this.elementosCheckeados[j])
          this.pedidoService.updatePedidos(this.pedido_,num);

          if(pf != null) pf.reset();
      }
      this.toastr.warning('Operación Terminada', 'Preparación de almacén, anulada');
      this.onCancelar(pf,1);
    }
    else{
      this.onCancelar(pf,1);
    }
  }

  resetFormnf(pf?: NgForm){
    if(pf != null) pf.reset();
    this.pedidoService.txtBtnAccion = "Guardar";
  }
  resetFormnd(pf?: NgForm){
    if(pf != null) pf.reset();
    this.pedidoService.txtBtnAccion = "Guardar";
  }
  resetFormne(pf?: NgForm){
    if(pf != null) pf.reset();
    this.pedidoService.txtBtnAccion = "Guardar";
  }

  moForm(opc?: number){
    if (opc==1){
      this.opcnf = true;
      this.opcnd = false;
      this.opcne = false;

      if (this.pedido_.ffactura == null || typeof this.pedido_.ffactura === "undefined"){
        this.pedido_.ffactura =  new Date();
      }else{
        this.pedido_.ffactura = this.pedido_.ffactura;
      }

      this.pedidoService.txtBtnAccion = "Guardar";
    }

    if (opc==2){
      this.opcnf = false;
      this.opcnd = true;
      this.opcne = false;

      if (this.pedido_.fdespacho == null || typeof this.pedido_.fdespacho === "undefined"){
        //this.pedido_.fdespacho =  new Date();
      }else{
        this.pedido_.fdespacho = this.pedido_.fdespacho;
      }

      if (this.pedido_.ftentrega == null || typeof this.pedido_.ftentrega === "undefined"){
        //this.pedido_.ftentrega =  new Date();
      }else{
        this.pedido_.ftentrega = this.pedido_.ftentrega;
      }

      this.pedidoService.txtBtnAccion = "Guardar";
    }

    if (opc==3){
      this.opcnf = false;
      this.opcnd = false;
      this.opcne = true;

      if (this.pedido_.fentrega == null || typeof this.pedido_.fentrega === "undefined"){
        this.pedido_.fentrega =  new Date();
      }else{
        this.pedido_.fentrega = this.pedido_.fentrega;
      }

      if (this.pedido_.fpago == null || typeof this.pedido_.fpago === "undefined"){
        this.pedido_.fpago =  new Date();
      }else{
        this.pedido_.fpago = this.pedido_.fpago;
      }

      this.pedidoService.txtBtnAccion = "Guardar";
    }
  }

  timestampConvert2(fec){
    let dateObject = new Date(fec.seconds*1000);
    let mes_ = dateObject.getMonth()+1;
    let ano_ = dateObject.getFullYear();
    let dia_ = dateObject.getDate();
    return dateObject;
  }

  selectEventPed(elemento){
    this.pedido_ =  Object.assign({}, elemento);

    //Verifica que el pedido haya pasado por el proceso de almacen
    if (this.pedido_.nrobultos) this.someticket = true;

    const val = elemento.idcliente;
    const isLargeNumber = (element) => element.idcliente.trim() == val.trim();
    const indice = this.clienteList.findIndex(isLargeNumber);

    if (indice != -1){
      this.nomCli=this.clienteList[indice].descripcion;
      this.tlfCli=this.clienteList[indice].telefonof;
      this.dirCli=this.clienteList[indice].direccion;
      this.rifCli=this.clienteList[indice].rif;

      const idven = (element) => element.vzona.trim() == this.clienteList[indice].zona.trim();
      const indVen = this.vendedorList.findIndex(idven);
      this.zonVen = this.vendedorList[indVen].vzona;
    }
    if (this.pedido_.uid){
      this.MostrarPed = 'display:block;';
    }

    if (elemento.fechapedido != null && typeof elemento.fechapedido != "undefined"){
        this.pedido_.fechapedido = this.timestampConvert2(elemento.fechapedido);
    }
    if (elemento.ffactura != null || typeof elemento.ffactura != "undefined"){
        this.pedido_.ffactura = this.timestampConvert2(elemento.ffactura);
    }
    if (elemento.fpreparacion != null || typeof elemento.fpreparacion != "undefined"){
        this.pedido_.fpreparacion = this.timestampConvert2(elemento.fpreparacion);
    }
    if (elemento.ftentrega != null || typeof elemento.ftentrega != "undefined"){
        this.pedido_.ftentrega = this.timestampConvert2(elemento.ftentrega);
    }
    if (elemento.fentrega != null || typeof elemento.fentrega != "undefined"){
        this.pedido_.fentrega = this.timestampConvert2(elemento.fentrega);
    }
    if (elemento.fdespacho != null || typeof elemento.fdespacho != "undefined"){
        this.pedido_.fdespacho = this.timestampConvert2(elemento.fdespacho);
    }
    if (elemento.fpago != null || typeof elemento.fpago != "undefined"){
        this.pedido_.fpago = this.timestampConvert2(elemento.fpago);
    }



    this.moForm(this.pedidoService.selectedIndex);

    //Get Order detaills
    this.pedidoService.getPedidosDet(elemento.uid).subscribe(pedidosDet=>{
      this.pedidoslistDet = pedidosDet;

      for (let i in this.pedidoslistDet){
        this.totalPri = this.totalPri +  this.pedidoslistDet[i].preciomaterial;
        this.totalCnt = this.totalCnt +  this.pedidoslistDet[i].cantidadmaterial;
        this.totalPed = this.totalPed +  this.pedidoslistDet[i].totalpormaterial;

        //this.tmontb = this.tmontb + this.pedidoslistDet[i].totalpormaterial;
      }

      //Calculo del descuento en base al monto bruto
      this.tmontb = this.totalPed;
      this.tmontd = (this.totalPed*this.pedido_.descuentoporc)/100;
      this.tmontd = (this.tmontd + this.pedido_.descuentovalor);
      //Calculo del Impuesto en base al monto bruto
      let montoDescAux=0;
      if (this.tmontd>0){
        montoDescAux = this.tmontd;
      }
      this.tmonti = ((this.tmontb - montoDescAux)* this.pedido_.indicadorImpuestoporc)/100;

      //Calculo Monto Neto anterior
      //this.tmontn = (this.tmontb - montoDescAux) + this.tmonti;
      //Calculo Monto Neto sin iva
      this.tmontn = (this.tmontb - montoDescAux);
    })


    if (this.opcnf == true){
      if (this.pedido_.status == "ACTIVO" || this.pedido_.status == "FACTURADO"){
        this.ocultarBtn = "padding: 10px;display:block;";
      }else{
        this.mensaje01 = " Este pedido tiene asignada una factura"
        this.ocultarBtn = "padding: 10px;display:none;";
      }
    }
    if (this.opcnd == true){
      if (this.pedido_.status == "PREPARADO" ||  this.pedido_.status == "DESPACHADO"){
        this.ocultarBtn = "padding: 10px;display:block;";
      }else{
        this.mensaje01 = " Este pedido contiene una solicitud de despacho"
        this.ocultarBtn = "padding: 10px;display:none;";
      }
    }
    if (this.opcne == true){
      if (this.pedido_.status == "DESPACHADO" ||  this.pedido_.status == "ENTREGADO"){
        this.ocultarBtn = "padding: 10px;display:block;";
      }else{
        this.mensaje01 = " Este pedido contiene una solicitud de entrega"
        this.ocultarBtn = "padding: 10px;display:none;";
      }
    }

  }

  onChangeSearchPed(elemento){

    this.pedido_ =  Object.assign({}, elemento);
    if (this.pedido_.uid){
      this.MostrarPed = 'display:block;';
    }

    if (elemento.fechapedido != null && typeof elemento.fechapedido != "undefined"){
      this.pedido_.fechapedido = this.timestampConvert2(elemento.fechapedido);
    }
    if (elemento.ffactura != null || typeof elemento.ffactura != "undefined"){
        this.pedido_.ffactura = this.timestampConvert2(elemento.ffactura);
    }
    if (elemento.ftentrega != null || typeof elemento.ftentrega != "undefined"){
        this.pedido_.ftentrega = this.timestampConvert2(elemento.ftentrega);
    }
    if (elemento.fentrega != null || typeof elemento.fentrega != "undefined"){
        this.pedido_.fentrega = this.timestampConvert2(elemento.fentrega);
    }
    if (elemento.fdespacho != null || typeof elemento.fdespacho != "undefined"){
        this.pedido_.fdespacho = this.timestampConvert2(elemento.fdespacho);
    }
    if (elemento.fpago != null || typeof elemento.fpago != "undefined"){
        this.pedido_.fpago = this.timestampConvert2(elemento.fpago);
    }

    this.moForm(this.pedidoService.selectedIndex);

    //Get Order detaills
    this.pedidoService.getPedidosDet(elemento.uid).subscribe(pedidosDet=>{
      this.pedidoslistDet = pedidosDet;

      for (let i in this.pedidoslistDet){
        this.totalPri = this.totalPri +  this.pedidoslistDet[i].preciomaterial;
        this.totalCnt = this.totalCnt +  this.pedidoslistDet[i].cantidadmaterial;
        this.totalPed = this.totalPed +  this.pedidoslistDet[i].totalpormaterial;

        //this.tmontb = this.tmontb + this.pedidoslistDet[i].totalpormaterial;
      }

      //Calculo del descuento en base al monto bruto
      this.tmontb = this.totalPed;
      this.tmontd = (this.totalPed*this.pedido_.descuentoporc)/100;

      //Calculo del Impuesto en base al monto bruto
      let montoDescAux=0;
      if (this.tmontd>0){
        montoDescAux = this.tmontd;
      }
      this.tmonti = ((this.tmontb - montoDescAux)* this.pedido_.indicadorImpuestoporc)/100;

      //Calculo Monto Neto anterior
      //this.tmontn = (this.tmontb - montoDescAux) + this.tmonti;
      //Calculo Monto Neto sin iva
      this.tmontn = (this.tmontb - montoDescAux);
    })

    if (this.pedido_.status == "ACTIVO"){
      this.ocultarBtn = "padding: 10px;display:block;";
    }else{
      this.ocultarBtn = "padding: 10px;display:none;";
    }

  }

  closeautoCompletePed(){

    this.MostrarPed = 'display:none;';
    this.mensaje01 = "";
    this.valorAutPed = "";
    this.pedido_.uid = "";
    this.pedido_.fechapedido = null;
    this.pedido_.status = "";
    this.pedido_.idcliente = "";
    this.pedido_.idvendedor = "";
    this.pedido_.nomvendedor = "";
    this.pedido_.condiciondepago = "";
    this.pedido_.nomcliente = "";
    this.pedido_.email = "";
    this.pedido_.listaprecio = "";
    this.pedido_.codigodematerial = "Ninguno";
    this.pedido_.descripcionmaterial = "";
    this.pedido_.preciomaterial = this.myempty;
    this.pedido_.cantidadmaterial = this.myempty;
    this.pedido_.totalpormaterial = this.myempty;
    this.pedidoslistDet = []; // vacia la instancia
    this.pedido_ = {} as Pedido;
    this.totalPri = 0;
    this.totalCnt = 0;
    this.totalPed = 0;

    this.tmontb = 0;
    this.tmontd = 0;
    this.tmonti = 0;
    this.tmontn = 0;
    this.pedido_.descuentovalor = this.myempty;
    this.pedido_.descuentoporc = this.myempty;
    if (this.pedidoService.selectedIndex==1){
      this.resetFormnf(this.myFormnf);
    }
    if (this.pedidoService.selectedIndex==2){
      this.resetFormnf(this.myFormnd);
    }
    if (this.pedidoService.selectedIndex==3){
      this.resetFormnf(this.myFormne);
    }
  }

}//Clase
