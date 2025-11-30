import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Tailwind } from "@react-email/components";
import * as React from "react";

interface NewOrderGestorEmailProps {
  nombreGestor: string;
  nombreNegocio: string;
  idPedido: number;
  total: number;
  nombreCliente: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const NewOrderGestorEmail = ({
  nombreGestor,
  nombreNegocio,
  idPedido,
  total,
  nombreCliente,
}: NewOrderGestorEmailProps) => {
  const previewText = `¡Nuevo pedido de $${total} en ${nombreNegocio}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-stone-100 font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded-3xl border border-solid border-stone-200 bg-white p-[20px]">
            
            <Section className="mt-[20px] mb-[20px] text-center">
              <div className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-700">
                🔔 Nuevo Pedido Recibido
              </div>
            </Section>

            <Heading className="mx-0 my-[20px] p-0 text-center text-[28px] font-bold text-stone-900">
              ${total.toFixed(2)}
            </Heading>

            <Text className="text-[16px] leading-[24px] text-stone-700 text-center">
              Hola <strong>{nombreGestor}</strong>, <br/>
              El cliente <strong>{nombreCliente}</strong> acaba de realizar un pedido (<strong>#{idPedido}</strong>) en tu negocio.
            </Text>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded-full bg-green-600 px-6 py-4 text-center text-[14px] font-bold text-white no-underline shadow-md"
                href={`${baseUrl}/pedidos`}
              >
                Ver Pedido en el Tablero
              </Button>
            </Section>
            
            <Text className="text-[12px] text-stone-500 text-center">
              Es importante que actualices el estado del pedido a &quot;En Preparación&quot; para notificar al cliente.
            </Text>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default NewOrderGestorEmail;