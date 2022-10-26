import { Pedido} from './pedido'

export class TransportePedidos{
	$key		: string;
	id?			: string;
	fecha?		: string;
	compania?	: string;
	chofer?		: string;
	vehiculo?    : string;
	placa?       : string;
	tasa?		: number;
	estatus?		: string;
	fechaCierre?	: string;
	totalUSD?	: number;
	totalBsF?	: number		
	pedido?		: any;
}