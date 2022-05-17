import { Component, OnInit,ViewChild } from '@angular/core';
import { CobrosService } from 'src/app/services/cobros.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Pedido } from 'src/app/models/pedido';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FirebaseloginService } from 'src/app/services/firebaselogin.service';

//  Service 
import { Cobro } from 'src/app/models/cobro';
import { CobroDet } from 'src/app/models/cobro-det';
import { VpagoService } from '../../../services/vpago.service';
import { BancoService } from '../../../services/banco.service';
//models
import { Vpago } from '../../../models/vpago';
import { Banco } from '../../../models/banco';
import { PedidoService } from 'src/app/services/pedido.service';
import { TipodocCobros } from 'src/app/models/tipodoc-cobros';
import { TipodcobrosService } from 'src/app/services/tipodcobros.service';
import * as moment from 'moment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { MatPaginator } from '@angular/material/paginator';



@Component({
  selector: 'app-gcobro-list',
  templateUrl: './gcobro-list.component.html',
  styleUrls: ['./gcobro-list.component.css']
})
export class GcobroListComponent implements OnInit {
  txtComentario = "";
  mostrardiv:boolean=false;
  pedIndex: number=-990;
  idpedidoEli: string="";
  fechapedidoEli: Date;
  clientepedidoEli: string="";
  montodepago = 0;
  disableBSF =  false;
  maxDate= moment(new Date()).format('YYYY-MM-DD');


  //datos de la tabla externa
  dataSource: any;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  displayedColumns: string[] = ['idpedido', 'nrofactura','condiciondepago', 'fpago','nomcliente','nomvendedor', 'Subtotal', 'totalmontoimpuesto', 'totalmontoneto','abono','Opc'];
  
  pedidoPend_ = {} as Pedido;
  cobro0_ = {} as Cobro;
  cobro_ = {} as Cobro;
  cobroDet_ = {} as CobroDet;
  MostrarCob: string;
  vp_efectivo=true;
  pagototal=true;
  pagoparcialpagado:number = 0;
  ver:boolean;
  sendemail=false;
  importeremanente = 0;
  visual = false;

  showSpinner = false;

  public vpagoList: Vpago[]; //arreglo vacio
  public tipodocList: TipodocCobros[]; //arreglo vacio
  public bancoList: Banco[]; //arreglo vacio
  cobroslist = [];
  matrisDetCobro: Cobro[]=[];
  pedidoCobro: Pedido[];
  pedido: Pedido[];


  constructor(
    public cobroService: CobrosService,
    public loginS      : FirebaseloginService,
    private toastr     : ToastrService,
    public vpagoS      : VpagoService,
    public tipodcobroS : TipodcobrosService,
    public bancoS      : BancoService,
    public pedidoS     : PedidoService,
  ) { }

  ngOnInit(): void {
    this.showSpinner = true;
    this.pedidoPend_ = {} as Pedido;

    this.pedidoS.getPedidosPendientes().subscribe( pedidosP => {
      this.cobroslist = pedidosP;
      
      //ELEMENT_DATA
      this.dataSource = new MatTableDataSource( this.cobroslist);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.showSpinner = false;
    })

    this.vpagoS.getVpagos().valueChanges().subscribe(vps =>{
      this.vpagoList = vps;
    })

    this.tipodcobroS.getTipods().valueChanges().subscribe(tipdoc => {
      this.tipodocList = tipdoc;
    });

    this.bancoS.getBancos().valueChanges().subscribe(bc =>{
      this.bancoList = bc;
    })

  }//ngOnInit

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }//applyFilter

  verdetalles($event,elemento){
    this.ver = true;
    this.visual = true;

    this.pedidoPend_ =  Object.assign({}, elemento);

    let idpedido = this.pedidoPend_.idpedido.toString();

    if (elemento.fpago != null && typeof elemento.fpago != "undefined"){
      this.pedidoPend_.fpago = this.timestampConvert(elemento.fpago);
    }

    this.cobroService.getCobrosDet(idpedido).subscribe(cobrosDet=>{

      this.matrisDetCobro = cobrosDet;

      this.pagoparcialpagado = 0; //reiniciamos el pago parcial para que no se embasure

      for (let i in this.matrisDetCobro) {
        if(this.matrisDetCobro[i].fechadepago) this.matrisDetCobro[i].fechadepago = this.timestampConvert(this.matrisDetCobro[i].fechadepago);
        
        if(this.matrisDetCobro[i].status == "ACTIVO"){
          this.pagoparcialpagado += Number(this.matrisDetCobro[i].montodepago);
        }
      }

      if ( this.pagoparcialpagado > 0 ) {
        this.importeremanente = this.roundTo(this.pedidoPend_.totalmontoneto - this.pagoparcialpagado,2)
      } else {
        this.importeremanente = this.pedidoPend_.totalmontoneto;
      }
              
    }) 
    
    if (this.pedidoPend_.idpedido){
      this.MostrarCob = 'display:block;';
    }
  }//verdetalles

  selectEventCob(elemento) {

    this.montodepago = 0;
    this.pagoparcialpagado = 0; //reiniciamos el pago parcial para que no se embasure
    this.visual = false; //No es la parte de visualizacion

    this.pedidoPend_ =  Object.assign({}, elemento);
    let idpedido = this.pedidoPend_.idpedido.toString();

    if (elemento.fpago != null && typeof elemento.fpago != "undefined"){
      this.pedidoPend_.fpago = this.timestampConvert(elemento.fpago);
    }

    //Get Order detaills
    this.cobroService.getCobrosDet(idpedido).subscribe(cobrosDet => {

      this.matrisDetCobro = cobrosDet;

      this.pagoparcialpagado = 0; //reiniciamos el pago parcial para que no se embasure

      //Calculamos el monto total pagado
      for (let i in this.matrisDetCobro) {
        if(this.matrisDetCobro[i].fechadepago) {
          this.matrisDetCobro[i].fechadepago = this.timestampConvert(this.matrisDetCobro[i].fechadepago);
        }

        if(this.matrisDetCobro[i].modificado) {
          this.matrisDetCobro[i].modificado = this.timestampConvert(this.matrisDetCobro[i].modificado);
        }

        if(this.matrisDetCobro[i].status == "ACTIVO"){
          this.pagoparcialpagado += Number(this.matrisDetCobro[i].montodepago);
        }
      }

      if ( this.pagoparcialpagado > 0 ) {
        this.importeremanente = this.roundTo(this.pedidoPend_.totalmontoneto - this.pagoparcialpagado,2)
      } else {
        this.importeremanente = this.pedidoPend_.totalmontoneto;
      }
              
    }) 
    
    if (this.pedidoPend_.idpedido){
      this.MostrarCob = 'display:block;';
    }

  }//selectEventCob

  onEdit(event, ped){

  }//onEdit

  moForm(){
    if (this.cobroService.mostrarForm){
      this.cobroService.mostrarForm = false;
    }else{
      this.cobroService.mostrarForm = true;
    }


  }//moForm

  onSubmit(pf?: NgForm) {
    if(this.pedidoPend_.idpedido != null) {
      
      let thisHour =  moment().hour();
      let thisMinute = moment().minutes();

      this.cobro_.fechadepago =  moment(this.cobro_.fechadepago).utcOffset("-04:00").add(moment.duration(`${thisHour}:${thisMinute}:00`)).toDate();
      
      this.cobro_.modificado = new Date;
      this.cobro_.modificadopor = this.loginS.getCurrentUser().email;
      this.cobro_.idpedido = this.pedidoPend_.idpedido;
      this.cobro_.status = "ACTIVO";
      this.pedidoPend_.status="ABONADO";

      this.cobro_.montodepago = Number(this.montodepago);

      if (this.pedidoPend_.totalmontoneto.toFixed(2) ==  this.pagoparcialpagado + this.cobro_.montodepago.toFixed(2)) {
        this.pedidoPend_.status="COBRADO";
      }  

      //Actualiza el pedido
      this.pedidoS.updatePedidos(this.pedidoPend_);
      //Registra el cobro/pago
      this.cobroService.addCobros(this.cobro_);

      this.toastr.success('Operación Terminada', 'Registro Actualizado');
      this.onCancelar(pf);
    }
    
  }

  //select via de pago
  vpagoselected(val) {
    //si no es efectivo
    if (val.substr(0,3)!="EFE"){ 
      this.vp_efectivo=false;
    } else {
      this.cobro_.banco = "";
      //this.cobro_.nroreferencia="";
      this.vp_efectivo=true;
    }

    if (val.substr(0,3)=="OLD"){ //quitar
      this.cobro_.banco = "";
      //this.cobro_.nroreferencia="";
      this.vp_efectivo=true;
    }
  }//vpagoselected

  tipodocSelected(val) {
    if (val == "GE01") {
      this.vp_efectivo=true;
      this.cobro_.moneda ="USD";
      this.disableBSF = true;
    }
  }

  //Select bancos
  bancoselected(val) {
    //Buscamos en la lista de bancos el que coincida con el nombre del banco seleccionado
    // y determinamos su moneda
    let bancoSelected = this.bancoList.find( banco => banco.nombre == val);
    this.cobro_.moneda = bancoSelected.moneda;

    if ( this.cobro_.moneda !== "BSF") this.disableBSF = true;
    else this.disableBSF = false;
    
  }

  monedaSelected(tipomoneda) {
    if (tipomoneda != "BSF") this.disableBSF = true;
    else this.disableBSF = false;
  }

  //Select tipo de pago
  tpagoselected(val) {
  
    if (val == "TOTAL") {
      this.cobro_.montodepago = parseFloat((this.pedidoPend_.totalmontoneto-this.pagoparcialpagado).toFixed(2));
      this.montodepago =  this.cobro_.montodepago;
      this.pedidoPend_.statuscobro = "COBRADO"
      this.pagototal = true;
    }
    else if (val == "PARCIAL") {
      this.montodepago = 0;
      this.pedidoPend_.statuscobro = "PARCIAL"
      this.pagototal = false;
    }
  }

  //Se ejecuta cuando ingresan un monto
  montoChanged(monto) {
    let montostring = monto;
    if (Number(montostring) > (this.importeremanente)) {
      this.montodepago = 0;
    } else {
      this.montodepago == monto;
    }
  }

  timestampConvert(fec) {
    let dateObject = new Date(fec.seconds*1000);
    
    let mes_ = dateObject.getMonth()+1;
    let ano_ = dateObject.getFullYear();
    let dia_ = dateObject.getDate();
    return dateObject;
  }//timestampConvert

  onCancelar(pf?: NgForm ){
    if(pf != null) pf.reset();
    this.cobroslist=[];
    this.cobro_ = {} as Cobro;
    this.pedidoPend_ = {} as Pedido;
    this.MostrarCob = 'display:none;';
    this.pagoparcialpagado = 0;
    this.ver=false;
  }//onCancelar

  eliminarCobro(posicionArray) {
    if(confirm('¿Está seguro de que quiere eliminar este elemento?')) {

      let cobroDelete = {} as Cobro;
      cobroDelete = this.matrisDetCobro[posicionArray];
      cobroDelete.status = "ELIMINADO";
      cobroDelete.modificadopor = this.loginS.getCurrentUser().email;
      cobroDelete.modificado = new Date;
  
      this.cobroService.updatecobros(cobroDelete);

      this.toastr.warning('Operación Terminada', 'Registro de cobro eliminado');
    }
  }

  cancelNotifi(){
    this.cobro0_ = {} as Cobro;
    this.sendemail = false;
  }//onCancelar


  sendpopup(e){
    this.cobro0_ =  Object.assign({}, e);
    this.sendemail=true;
  }
  sendUpdate(){
    this.sendemail=true;
    //Update Cobro - 
    this.cobro0_.lastnotifsend = new Date;
    this.cobro0_.sendmail=true;
    this.cobroService.updatecobros(this.cobro0_);
    this.cancelNotifi();
    this.toastr.success('Operación Terminada', 'Se ha enviado una notificación de cobro');
  }


  roundTo(num: number, places: number) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
  };
}
