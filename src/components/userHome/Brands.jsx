// src/components/PartnerLogos/PartnerLogos.jsx

const Brands = ({ logos }) => {
  return (
    <section className="logos-section py-6">
      <div className="flex justify-center gap-8">
        {logos.map((logo, index) => (
          <img key={index} src={logo.src} alt={logo.alt} className="h-16" />
        ))}
      </div>
    </section>
  );
};

export default Brands;
