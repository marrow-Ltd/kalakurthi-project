import CustomOrderForm from "../components/CustomOrderForm";

const CustomOrder = () => {
  return (
    <div className="py-16 px-4">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="section-eyebrow justify-center flex">Made Just For You</span>
        <h1 className="font-display text-4xl text-plum font-semibold mb-3">Custom Order Request</h1>
        <p className="text-plum-dark/70">
          Tell us your vision — a cherished photo, a favourite fabric, or a colour palette close to your
          heart — and we'll stitch it into something you'll treasure.
        </p>
      </div>
      <CustomOrderForm />
    </div>
  );
};

export default CustomOrder;
