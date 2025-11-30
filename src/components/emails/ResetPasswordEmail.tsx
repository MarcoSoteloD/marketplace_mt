import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text, Tailwind } from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  nombreUsuario: string;
  resetLink: string;
}

export const ResetPasswordEmail = ({
  nombreUsuario,
  resetLink,
}: ResetPasswordEmailProps) => {
  const previewText = `Restablece tu contraseña en Manos Tonilenses`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-stone-50 font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded-3xl border border-solid border-stone-200 bg-white p-[20px]">
            
            <Section className="mt-[32px] text-center">
              <div className="text-2xl font-bold text-orange-600">Manos Tonilenses</div>
            </Section>

            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-stone-800">
              ¿Olvidaste tu contraseña?
            </Heading>

            <Text className="text-[14px] leading-[24px] text-stone-600 text-center">
              Hola <strong>{nombreUsuario}</strong>,<br/>
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
            </Text>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded-full bg-stone-800 px-6 py-4 text-center text-[14px] font-bold text-white no-underline shadow-md"
                href={resetLink}
              >
                Restablecer Contraseña
              </Button>
            </Section>
            
            <Text className="text-[12px] text-stone-500 text-center leading-[24px]">
              Si no solicitaste este cambio, puedes ignorar este correo con seguridad. 
              El enlace expirará en 1 hora.
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-stone-200" />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;