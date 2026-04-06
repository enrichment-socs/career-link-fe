import { TableHead, TableHeader, TableRow } from "./table"

const MasterDataTableHeader = () => {

    return (
        <>
        <TableHeader className="p-5 items-center flex w-full">
            <TableRow className="flex w-full text-xs">
              <TableHead className="h-full w-[2%] font-medium text-center">No.</TableHead>
              <TableHead className="h-full w-[6%] text-center">NIM</TableHead>
              <TableHead className="h-full w-[8%] text-center">Name</TableHead>
              <TableHead className="h-full w-[10%] text-center">Email</TableHead>
              <TableHead className="h-full w-[7%] text-center">Phone</TableHead>
              <TableHead className="h-full w-[6%] text-center">Major</TableHead>
              <TableHead className="h-full w-[3%] text-center">GPA</TableHead>
              <TableHead className="h-full w-[7%] text-center whitespace-normal">Status</TableHead>
              <TableHead className="h-full w-[7%] text-center whitespace-normal">Position</TableHead>
              <TableHead className="h-full w-[5%] text-center">Skill</TableHead>
              <TableHead className="h-full w-[5%] text-center">CV</TableHead>
              <TableHead className="h-full w-[7%] text-center whitespace-normal">Company</TableHead>
              <TableHead className="h-full w-[7%] text-center whitespace-normal">Business</TableHead>
              <TableHead className="h-full w-[8%] text-center whitespace-normal">University</TableHead>
              <TableHead className="h-full w-[12%] text-center">Actions</TableHead>
            </TableRow>
            </TableHeader>
        </>
    )
}

const ReportDataTableHeader = () => {

    return (
        <>
        <TableHeader className="p-5 items-center flex w-full">
            <TableRow className="flex w-full">
              <TableHead className="h-full w-[3%] font-medium text-center">  </TableHead>
              <TableHead className="h-full w-[12%] text-center">NIM</TableHead>
              <TableHead className="h-full w-[15%] text-center">Name</TableHead>
              <TableHead className="h-full w-[8%] text-center">Clock In</TableHead>
              <TableHead className="h-full w-[8%] text-center">Clock Out</TableHead>
              <TableHead className="h-full w-[11%] text-center whitespace-normal word-break">Pre Test Submitted</TableHead>
              <TableHead className="h-full w-[11%] text-center whitespace-normal word-break">Passed Post Test</TableHead>
              <TableHead className="h-full w-[11%] text-center whitespace-normal word-break">Assignment Submitted</TableHead>
              <TableHead className="h-full w-[11%] text-center whitespace-normal word-break">Grade A Assignment</TableHead>
              <TableHead className="h-full w-[10%] text-center">Certificate</TableHead>
            </TableRow>
            </TableHeader>
        </>
    )
}

const DefaultTableHeader = ({columns}:{columns:string[]}) => {

    const style = `w-1/${columns.length} text-center`
    return (
        <>
            <TableHeader className="p items-center flex w-full border-b-1 border-gray-200">
                <TableRow className="flex w-full">
                {columns.map(e => <TableHead key={e} style={{width:`${Math.floor(100/columns.length)}%`}} className={`text-center`}>{e}</TableHead>)}
                </TableRow>
            </TableHeader>
        </>
    )
}

export {MasterDataTableHeader, DefaultTableHeader, ReportDataTableHeader}