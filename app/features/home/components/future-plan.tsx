import { MdEdit } from "react-icons/md";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { EmploymentStatus } from "~/types/enum";

interface Props {
  onClick: () => void;
  skill: string;
  position: string;
  employment_status: EmploymentStatus;
  company_name?: string;
  business_type?: string;
  university_name?: string;
}

const FuturePlan = ({ onClick, skill, position, employment_status, company_name, business_type, university_name }: Props) => {

  const positionLabel = employment_status === EmploymentStatus.EMPLOYED ? "Position" : "Future Position";

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-primary mb-2">
                {positionLabel}
              </h3>
              <p className="text-lg">{position || "-"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClick}>
            <MdEdit className="w-5 h-5"/>
          </Button>
        </div>

        <Separator/>

        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-primary mb-2">
                Employment Status
              </h3>
              <p className="text-lg">{employment_status}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClick}>
            <MdEdit className="w-5 h-5"/>
          </Button>
        </div>

        {employment_status === EmploymentStatus.EMPLOYED && (
          <>
            <Separator/>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-primary">Company Name</h3>
              <p className="text-lg">{company_name || "-"}</p>
            </div>
          </>
        )}

        {employment_status === EmploymentStatus.ENTREPRENEUR && (
          <>
            <Separator/>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-primary">Business Type</h3>
              <p className="text-lg">{business_type || "-"}</p>
            </div>
          </>
        )}

        {employment_status === EmploymentStatus.STUDY && (
          <>
            <Separator/>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-primary">University / Institution</h3>
              <p className="text-lg">{university_name || "-"}</p>
            </div>
          </>
        )}

        <Separator/>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-primary">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skill.split(',').map((s, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {s}
                </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FuturePlan;
