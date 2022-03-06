//export class Pedido {
export interface Pedido {
  uid?: string;
  idpedido?: number; //
  fechapedido?: Date;
  idcliente?: string;
  nomcliente?: string;
  idvendedor?: string;
  nomvendedor?: string;
  listaprecio?: string;
  condiciondepago?: string;
  email?: string;
  codigodematerial?: string;
  descripcionmaterial?: string;
  cantidadmaterial?: number;
  unidaddemedida?: string;
  preciomaterial?: number;
  totalpormaterial?: number;
  creado?: Date;
  creadopor?: string;
  modificado?: Date;
  modificadopor?: string;
  descuentoporc?: number;
  descuentovalor?: number;
  totalmontobruto?: number;
  totalmontodescuento?: number;
  totalmontoimpuesto?: number;
  totalmontoneto?: number;
  precioasociado?: string;
  totalPri?: number;
  totalCnt?: number;
  totalPed?: number;
  indicadorImpuestodesc?: string;
  indicadorImpuestoporc?: number;
  motivorechazo?: string;
  platform?: string;
  ffactura?: Date;
  nrofactura?: string;
  fpreparacion?:Date; //Fecha de preparacion en el almacen
  nombrealmacenista?:string;
  nrobultos?:number;
  fdespacho?: Date;
  ftentrega?: Date;
  fentrega?: Date;
  fpago?: Date;
  tipodoc?: string;
  codeBlock?: string;
  companycod?: string;
  companyblk?: string;
  companydir?: string;
  clientedir?: string;
  pdfurl?: string;
  observacion?: string;
  pdfname?: string;
  pdfb64?: string;
  lastaction?: string;
  transporte?: string;
  status?: string;
}
