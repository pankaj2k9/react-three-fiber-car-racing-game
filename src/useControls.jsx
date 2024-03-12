import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useControls } from 'leva';


export const useCarControls = (vehicleApi, chassisApi, thirdPerson) => {
  let [controls, setControls] = useState({});
  const { accelator, turnSpeedFrontWheels, turnSpeedBackWheels, breakPressure } = useControls({
    accelator:
    {
      value: 150,
      min: 10,
      max: 300,
      step: 5
    },
    turnSpeedFrontWheels: {
      value: 0.5,
      min: 0.1,
      max: 2,
      step: .1
    },
    turnSpeedBackWheels: {
      value: 0.35,
      min: 0.1,
      max: 2,
      step: .1
    },
    breakPressure: {
      value: 1,
      min: 1,
      max: 5,
      step: 0.5
    },
  })

  const limitAngularVelocity = () => {
    const vehicleBody = vehicleApi?.current?.api;
    if (vehicleBody) {
      const angularVelocity = vehicleBody.angularVelocity.get();
      const maxAngularVelocity = 5;
      if (angularVelocity.length() > maxAngularVelocity) {
        angularVelocity.normalize().multiplyScalar(maxAngularVelocity);
        vehicleBody.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
      }
    }
  };

  useFrame((state) => {
    limitAngularVelocity();
  })


  useEffect(() => {
    if (thirdPerson) {
      const keyDownPressHandler = (e) => {
        setControls((controls) => ({ ...controls, [e.key.toLowerCase()]: true }));
      }

      const keyUpPressHandler = (e) => {
        setControls((controls) => ({ ...controls, [e.key.toLowerCase()]: false }));
      }

      window.addEventListener("keydown", keyDownPressHandler);
      window.addEventListener("keyup", keyUpPressHandler);

      return () => {
        window.removeEventListener("keydown", keyDownPressHandler);
        window.removeEventListener("keyup", keyUpPressHandler);
      }
    }


  }, [thirdPerson]);

  useEffect(() => {
    if (!vehicleApi || !chassisApi) return;

    if (controls.w) {
      vehicleApi.applyEngineForce(accelator, 2);
      vehicleApi.applyEngineForce(accelator, 3);
    } else if (controls.s) {
      vehicleApi.applyEngineForce(-1 * accelator, 2);
      vehicleApi.applyEngineForce(-1 * accelator, 3);
    } else {
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
    }
    if (controls.a) {
      vehicleApi.setSteeringValue(turnSpeedBackWheels, 2);
      vehicleApi.setSteeringValue(turnSpeedBackWheels, 3);
      vehicleApi.setSteeringValue(-1 * turnSpeedFrontWheels, 0);
      vehicleApi.setSteeringValue(-1 * turnSpeedFrontWheels, 1);
    } else if (controls.d) {
      vehicleApi.setSteeringValue(-1 * turnSpeedBackWheels, 2);
      vehicleApi.setSteeringValue(-1 * turnSpeedBackWheels, 3);
      vehicleApi.setSteeringValue(turnSpeedFrontWheels, 0);
      vehicleApi.setSteeringValue(turnSpeedFrontWheels, 1);
    } else {
      for (let i = 0; i < 4; i++) {
        vehicleApi.setSteeringValue(0, i);
      }
    }

    if (controls.arrowdown) chassisApi.applyLocalImpulse([0, -5, 0], [0, 0, +1]);
    if (controls.arrowup) chassisApi.applyLocalImpulse([0, -5, 0], [0, 0, -1]);
    if (controls.arrowleft) chassisApi.applyLocalImpulse([0, -5, 0], [-0.5, 0, 0]);
    if (controls.arrowright) chassisApi.applyLocalImpulse([0, -5, 0], [+0.5, 0, 0]);

    if (controls.r) {
      chassisApi.position.set(-1.5, 0.5, 3);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(0, 0, 0);
    }
    if (controls.x) {
      vehicleApi.setBrake(breakPressure, 2);
      vehicleApi.setBrake(breakPressure, 3);
    } else {
      vehicleApi.setBrake(0, 2);
      vehicleApi.setBrake(0, 3);
    }
  }, [controls, vehicleApi, chassisApi]);

  return controls;
}