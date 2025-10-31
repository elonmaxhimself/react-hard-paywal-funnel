import StepWrapper from "@/components/StepWrapper";
import { Button } from "@/components/ui/button";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import SpriteIcon from "@/components/SpriteIcon";

const BRAND_IDS: string[] = [
    "brands-top-ai-tools-logo",
    "brands-aixploria-logo",
    "brands-zerohedge-logo",
    "brands-taaft-logo",
    "brands-the-ai-journal",
    "brands-nsfwaii-logo",
    "brands-toolify-ai-logo",
    "brands-entrepreneur-logo",
    "brands-citypaper-logo",
];

export function SocialProofStep() {
    const { nextStep } = useStepperContext();

    const FRAME_W = 126;
    const FRAME_H = 34;

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center">
                    <SpriteIcon src="/images/logo.svg" targetW={45} targetH={45} />

                    <h1 className="text-transparent bg-clip-text bg-primary-gradient text-[28px] font-extrabold uppercase mb-[18px] mt-3">
                        3+ million people
                    </h1>

                    <div className="text-white bg-[#000]/30 px-[28px] py-[20px] rounded-[10px] flex flex-col items-center justify-center mb-[30px]">
                        <div className="text-[45px] font-extrabold text-center leading-[30px]">
                            “
                        </div>
                        <div className="text-base font-semibold text-center capitalize mb-[25px]">
                            &quot;When it comes to finding the perfect AI girlfriend app in 2025,
                            Dream Companion easily tops the list.&quot;
                        </div>

                        <SpriteIcon
                            src="/images/brands/entrepreneur-logo.png"
                            targetW={116}
                            targetH={28}
                        />
                    </div>

                    <div className="w-full flex flex-col items-center justify-center">
                        <div className="text-white/70 text-xs font-semibold text-center uppercase mb-[22px]">
                            Mentioned in:
                        </div>

                        <ul className="grid grid-cols-3 gap-4 items-center justify-center mb-[30px] sm:mb-[70px]">
                            {BRAND_IDS.map((id) => (
                                <li key={id} className="flex items-center justify-center">
                                    <SpriteIcon
                                        id={id}
                                        src={`/images/${id.replace(/^brands-/, "brands/")}.png`}
                                        targetW={FRAME_W}
                                        targetH={FRAME_H}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div
                    className="
            w-full
            flex items-center justify-center
            px-[15px] sm:px-10
            p-5
            bg-black-2
            sm:static fixed bottom-0 left-0
          "
                >
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient">
                            <span className="text-base font-bold">Continue</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

export default SocialProofStep;
