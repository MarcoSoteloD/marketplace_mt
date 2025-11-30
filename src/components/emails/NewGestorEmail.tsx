import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text, Tailwind, Row, Column } from "@react-email/components";
import * as React from "react";

interface NewGestorEmailProps {
  nombreGestor: string;
  nombreNegocio: string;
  email: string;
  passwordRaw: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const NewGestorEmail = ({
  nombreGestor,
  nombreNegocio,
  email,
  passwordRaw,
}: NewGestorEmailProps) => {
  const previewText = `Cuídalas, son tu acceso a ${nombreNegocio}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-stone-100 font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded-3xl border border-solid border-stone-200 bg-white p-[20px]">
            
            <Section className="mt-[32px] text-center">
              <div className="text-2xl font-bold text-orange-600">Manos Tonilenses</div>
            </Section>

            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-stone-800">
              ¡Bienvenido, <strong>{nombreGestor}</strong>!
            </Heading>

            <Text className="text-[14px] leading-[24px] text-stone-600 text-center">
              Has sido registrado como administrador del negocio <strong>{nombreNegocio}</strong> en la plataforma municipal.
            </Text>
            
            <Text className="text-[14px] leading-[24px] text-stone-600 text-center mb-4">
              A continuación encontrarás tus credenciales para acceder al Panel de Gestión:
            </Text>

            {/* Caja de Credenciales */}
            <Section className="bg-stone-50 rounded-2xl p-6 border border-stone-100 text-center">
                <Text className="m-0 mb-2 text-[12px] font-bold uppercase tracking-widest text-stone-400">
                    Tus Datos de Acceso
                </Text>
                
                <Row className="mb-2">
                    <Column align="right" className="w-1/3 pr-4 text-[14px] font-semibold text-stone-600">
                        Correo:
                    </Column>
                    <Column align="left" className="text-[14px] text-stone-800 font-mono">
                        {email}
                    </Column>
                </Row>
                <Row>
                    <Column align="right" className="w-1/3 pr-4 text-[14px] font-semibold text-stone-600">
                        Contraseña:
                    </Column>
                    <Column align="left" className="text-[14px] text-stone-800 font-mono bg-white px-2 py-1 rounded border border-stone-200 inline-block">
                        {passwordRaw}
                    </Column>
                </Row>
            </Section>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded-full bg-stone-800 px-6 py-4 text-center text-[14px] font-bold text-white no-underline shadow-md"
                href={`${baseUrl}/login`}
              >
                Iniciar Sesión
              </Button>
            </Section>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-stone-200" />

            <Text className="text-[12px] leading-[24px] text-stone-500 text-center">
              Te recomendamos cambiar tu contraseña al ingresar por primera vez.
              <br />
              H. Ayuntamiento de Tonila, Jalisco.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default NewGestorEmail;