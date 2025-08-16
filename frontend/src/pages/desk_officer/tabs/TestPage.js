import Test1 from "../components/Test1";
// import Test2 from "../components/Test2";

export default function TestPage() {
  const parentData = "parent data";

  return (
    <div>
      making a single form with multiple django models
      <Test1 parentData={parentData}></Test1>
      {/* <Test2></Test2> */}
    </div>
  );
}
