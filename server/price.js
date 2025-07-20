
function calculateRequestCost({ durationSec, vcpu = 1, ramGiB = 2 }) {
    const vcpuRate = 0.002;        // ₹ per vCPU-second
    const ramRate = 0.0002;        // ₹ per GiB-second
    const requestFee = 0.00051;    // ₹ per request
  
    const vcpuCost = vcpu * durationSec * vcpuRate;
    const ramCost = ramGiB * durationSec * ramRate;
    const totalCost = vcpuCost + ramCost + requestFee;
  
    return {
      vcpuCost: vcpuCost.toFixed(5),
      ramCost: ramCost.toFixed(5),
      requestFee: requestFee.toFixed(5),
      totalCost: totalCost.toFixed(5)
    };
  }

  const cost = calculateRequestCost({ durationSec: 60, vcpu: 1, ramGiB: 2 });
  console.log(cost);
