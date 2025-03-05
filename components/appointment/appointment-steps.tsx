import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ClientForm } from "./client-form";

interface AppointmentStepsProps {
	currentStep: number;
	totalSteps: number;
	onNext: () => void;
	onPrevious: () => void;
	canProceed: boolean;
}

export function AppointmentSteps({
	currentStep,
	totalSteps,
	onNext,
	onPrevious,
	canProceed,
}: AppointmentStepsProps) {
	return (
		<div className="space-y-6">
			<div className="flex justify-center">
				<div className="flex items-center space-x-2">
					{Array.from({ length: totalSteps }).map((_, index) => (
						<>
							{index > 0 && (
								<div
									key={`divider-${
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										index
									}`}
									className={`h-1 w-12 ${currentStep >= index + 1 ? "bg-primary" : "bg-muted"}`}
								/>
							)}
							<div
								key={`step-${index + 1}`}
								className={`flex h-8 w-8 items-center justify-center rounded-full ${
									currentStep >= index + 1
										? "bg-primary text-primary-foreground"
										: "border border-input"
								}`}
							>
								{index + 1}
							</div>
						</>
					))}
				</div>
			</div>

			<div className="flex justify-between">
				<Button
					variant="outline"
					onClick={onPrevious}
					disabled={currentStep === 1}
				>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Voltar
				</Button>
				{currentStep < totalSteps ? (
					<Button onClick={onNext} disabled={!canProceed}>
						Continuar
						<ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				) : null}
			</div>
		</div>
	);
}
