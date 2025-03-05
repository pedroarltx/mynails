interface Service {
	id: string;
	title: string;
	price: number;
	duration?: string;
}

interface ServiceSelectionProps {
	services: Service[];
	selectedService: string;
	onSelectService: (serviceId: string) => void;
}

export function ServiceSelection({
	services,
	selectedService,
	onSelectService,
}: ServiceSelectionProps) {
	return (
		<div className="grid gap-4">
			{services.map((service) => (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					key={service.id}
					className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:border-primary ${
						selectedService === service.id
							? "border-primary bg-primary/5"
							: "border-input"
					}`}
					onClick={() => onSelectService(service.id)}
				>
					<div>
						<h3 className="font-medium">{service.title}</h3>
						<p className="text-sm text-muted-foreground">
							Duração: {service.duration || "~30 min"}
						</p>
					</div>
					<div className="text-right">
						<p className="font-medium">R$ {service.price.toFixed(2)}</p>
					</div>
				</div>
			))}
		</div>
	);
}
