import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text, Tailwind } from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  nombreUsuario: string;
}

// URL base para las imágenes (en producción cámbienlo al dominio real)
const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const WelcomeEmail = ({ nombreUsuario }: WelcomeEmailProps) => {
  const previewText = `¡Un placer tenerte con nosotros, ${nombreUsuario}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-stone-50 font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded-3xl border border-solid border-stone-200 bg-white p-[20px]">
            
            {/* Logo */}
            <Section className="mt-[32px] text-center">
              {/* Usamos una imagen pública o el texto si no carga */}
              <div className="text-2xl font-bold text-orange-600">Manos Tonilenses</div>
            </Section>

            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-stone-800">
              ¡Bienvenido, <strong>{nombreUsuario}</strong>!
            </Heading>

            <Text className="text-[14px] leading-[24px] text-stone-600">
              Gracias por registrarte en la plataforma oficial de comercio local de Tonila.
              Estamos muy contentos de tenerte aquí.
            </Text>

            <Text className="text-[14px] leading-[24px] text-stone-600">
              Ahora podrás:
            </Text>

            <Section>
                <ul className="text-[14px] text-stone-600 list-disc pl-6">
                    <li className="mb-2">Explorar los mejores negocios del municipio.</li>
                    <li className="mb-2">Realizar pedidos directamente desde tu celular.</li>
                    <li className="mb-2">Apoyar la economía de nuestra comunidad.</li>
                </ul>
            </Section>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded-full bg-orange-600 px-5 py-3 text-center text-[12px] font-semibold text-white no-underline shadow-sm"
                href={`${baseUrl}/negocios`}
              >
                Explorar Negocios
              </Button>
            </Section>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-stone-200" />

            <Text className="text-[12px] leading-[24px] text-stone-500 text-center">
              H. Ayuntamiento de Tonila, Jalisco.
              <br />
              Impulsando el comercio local.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;